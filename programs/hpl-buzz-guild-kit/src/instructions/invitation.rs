use {
    // crate::assertion::assetion_project_of_address_container,
    crate::errors::ErrorCode,
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Token, TokenAccount},
    hpl_hive_control::{
        assertions::assert_indexed_reference,
        state::{AddressContainer, AddressContainerRole, IndexedReference},
    },
};

#[derive(Accounts)]
#[instruction(args: SendInvitationArgs)]
pub struct SendInvitation<'info> {
    /// Unique identifier for the guild
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub invitation_id: AccountInfo<'info>,

    /// GUILD KIT
    #[account()]
    pub guild_kit: Box<Account<'info, GuildKit>>,

    /// Guild state account
    #[account(mut, has_one = guild_kit)]
    pub guild: Box<Account<'info, Guild>>,

    /// Invitation state account
    #[account(
        init, payer = payer,
        space = Invitation::LEN,
        seeds = [
            b"invitation".as_ref(),
            guild.key().as_ref(),
            invitation_id.key().as_ref()
        ],
        bump
    )]
    pub invitation: Box<Account<'info, Invitation>>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = chief_address_container.role == AddressContainerRole::ProjectMints && chief_address_container.associated_with == guild_kit.project.key())]
    pub chief_address_container: Account<'info, AddressContainer>,

    /// the token account of the chief that is inviting the member
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        constraint = invited_by.owner == authority.key() &&
        invited_by.amount >= 0 as u64
    )]
    pub invited_by: Account<'info, TokenAccount>,

    /// the token account of the member that is being invited
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub inviting_mint: AccountInfo<'info>,

    /// the payer of the transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// the chief account that invited
    /// the payer of the transaction
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// RENT SYSVAR
    pub rent: Sysvar<'info, Rent>,

    /// TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// system program  
    pub system_program: Program<'info, System>,
}
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, PartialEq)]
pub struct SendInvitationArgs {
    pub chief_refrence: IndexedReference,
    pub new_member_refrence: IndexedReference,
}
pub fn send_invitation(ctx: Context<SendInvitation>, args: SendInvitationArgs) -> Result<()> {
    msg!("Creating invitation...");
    let invitation = &mut ctx.accounts.invitation;
    let guild = &mut ctx.accounts.guild;

    // CHIEF &  ADDRESS CONTAINERS
    let chief_address_container = &ctx.accounts.chief_address_container;

    guild
        .members
        .iter()
        .find(|member| member.reference == args.chief_refrence && member.role == MemberRole::Chief)
        .ok_or(ErrorCode::InvalidChief)?;

    // Check if chief reference is in the address container
    if !assert_indexed_reference(
        &args.chief_refrence,
        chief_address_container,
        ctx.accounts.invited_by.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::ChiefNotFound.into());
    }

    // CREATING INVITATION
    invitation.invitation_id = ctx.accounts.invitation_id.key();
    invitation.guild = guild.key();
    invitation.bump = ctx.bumps["invitation"];
    invitation.invited_by = ctx.accounts.authority.key();
    invitation.invited = args.new_member_refrence;

    Ok(())
}

// ACCEPT INVITATION INSTRUCTION
#[derive(Accounts)]
#[instruction(args: AcceptInvitationArgs)]
pub struct AcceptInvitation<'info> {
    /// GUILD KIT
    #[account()]
    pub guild_kit: Box<Account<'info, GuildKit>>,

    /// Guild state account
    #[account(mut, has_one = guild_kit)]
    pub guild: Box<Account<'info, Guild>>,

    /// Address container that stores the mint addresss of the collections
    #[account(mut, close = invited_by)]
    pub invitation: Box<Account<'info, Invitation>>,

    /// the chief account that invited
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut, address = invitation.invited_by)]
    pub invited_by: AccountInfo<'info>,

    /// Address container that stores the mint addresss of the collections
    #[account(
    constraint = member_address_container.role == AddressContainerRole::ProjectMints && 
                member_address_container.associated_with == guild_kit.project.key()
    )]
    pub member_address_container: Account<'info, AddressContainer>,

    /// Verify the owner of the mint
    #[account(mut, constraint= member_account.amount > 0 as u64)]
    pub member_account: Account<'info, TokenAccount>,

    /// PDA FOR verifying membership & locking mebership
    #[account(
        init,
          seeds = [
              b"membership_lock".as_ref(),
              guild.key().as_ref(),
              member_account.mint.as_ref()
          ],
          bump,
          payer = payer,
          space = MembershipLock::LEN
    )]
    pub membership_lock: Account<'info, MembershipLock>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// SYSTEM PROGRAM
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AcceptInvitationArgs {
    pub new_member_refrence: IndexedReference,
}

/// Add a member to a guild
pub fn accept_invitation(ctx: Context<AcceptInvitation>, args: AcceptInvitationArgs) -> Result<()> {
    let guild = &mut ctx.accounts.guild;
    let member_lock = &mut ctx.accounts.membership_lock;
    let member_account = &ctx.accounts.member_account;
    let member_address_container = &ctx.accounts.member_address_container;

    // Check if member reference is in the address container
    if !assert_indexed_reference(
        &args.new_member_refrence,
        member_address_container,
        member_account.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::MemberNotFound.into());
    }

    // adding member to the guild
    guild.members.push(Member {
        reference: args.new_member_refrence.clone(),
        role: MemberRole::Member,
    });

    // locking membership
    member_lock.guild = guild.key();
    member_lock.member_reference = args.new_member_refrence;

    Ok(())
}
