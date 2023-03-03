use crate::errors::ErrorCode;
use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Token, TokenAccount},
    hpl_hive_control::{
        assertions::assert_indexed_reference,
        state::{AddressContainer, AddressContainerRole, IndexedReference, Project},
    },
};

#[derive(Accounts)]
#[instruction(args: CreateInvitationArgs)]
pub struct CreateInvitation<'info> {
    /// Unique identifier for the guild
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub invitation_id: AccountInfo<'info>,

    /// guild state account
    #[account(mut)]
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

    /// PROJECT
    #[account(
        mut,
        constraint = project.key() == guild.project
    )]
    pub project: Box<Account<'info, Project>>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = chief_address_container.role == AddressContainerRole::ProjectMints && chief_address_container.associated_with == project.key())]
    pub chief_address_container: Account<'info, AddressContainer>,

    /// the token account of the chief
    #[account(constraint = chief_account.owner == authority.key() && chief_account.amount >= 0 as u64)]
    pub chief_account: Account<'info, TokenAccount>,

    /// the chief account that invited
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub chief: AccountInfo<'info>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = member_address_container.role == AddressContainerRole::ProjectMints && member_address_container.associated_with == project.key())]
    pub member_address_container: Account<'info, AddressContainer>,

    /// Verify the owner of the mint
    #[account(mut, constraint = member_account.amount > 0 as u64)]
    pub member_account: Account<'info, TokenAccount>,

    /// the payer of the transaction
    #[account(mut)]
    pub payer: Signer<'info>,

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
pub struct CreateInvitationArgs {
    pub chief_refrence: IndexedReference,
    pub new_member_refrence: IndexedReference,
}
pub fn create_invitation(ctx: Context<CreateInvitation>, args: CreateInvitationArgs) -> Result<()> {
    let invitation = &mut ctx.accounts.invitation;
    let guild = &mut ctx.accounts.guild;
    let chief = &mut ctx.accounts.chief;

    // CHIEF & MEMBER ACCOUNTS & ADDRESS CONTAINERS
    let chief_account = &ctx.accounts.chief_account;
    let member_account = &ctx.accounts.member_account;
    let chief_address_container = &ctx.accounts.chief_address_container;
    let member_address_container = &ctx.accounts.member_address_container;

    guild
        .members
        .iter()
        .find(|member| member.reference == args.chief_refrence && member.role == MemberRole::Chief)
        .ok_or(ErrorCode::ChiefNotFound)?;

    // Check if chief reference is in the address container
    if assert_indexed_reference(
        args.chief_refrence.clone(),
        chief_address_container.clone(),
        chief_account.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::ChiefNotFound.into());
    }

    // Check if member reference is in the address container
    if assert_indexed_reference(
        args.new_member_refrence.clone(),
        member_address_container.clone(),
        member_account.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::MemberNotFound.into());
    }

    // CREATING INVITATION
    invitation.guild = guild.key();
    invitation.bump = ctx.bumps["invitation"];
    invitation.invited_by = chief.key();
    invitation.invited = args.new_member_refrence;

    Ok(())
}

// ACCEPT INVITATION INSTRUCTION
#[derive(Accounts)]
#[instruction(args: AcceptInvitationArgs)]
pub struct AcceptInvitation<'info> {
    /// Guild state account
    #[account(mut)]
    pub guild: Box<Account<'info, Guild>>,

    /// PROJECT
    #[account(
        mut,
        constraint = project.key() == guild.project
    )]
    pub project: Box<Account<'info, Project>>,

    /// Address container that stores the mint addresss of the collections
    #[account(mut, close = chief)]
    pub invitation: Box<Account<'info, Invitation>>,

    /// the chief account that invited
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub chief: AccountInfo<'info>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = member_address_container.role == AddressContainerRole::ProjectMints && member_address_container.associated_with == project.key())]
    pub member_address_container: Account<'info, AddressContainer>,

    /// Verify the owner of the mint
    #[account(mut, constraint= member_account.amount > 0 as u64)]
    pub member_account: Account<'info, TokenAccount>,

    /// PDA FOR verifying membership & locking mebership
    #[account(
        init,
          seeds = [
              b"membership_lock".as_ref(),
              project.key().as_ref(),
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
    pub chief_refrence: IndexedReference,
    pub new_member_refrence: IndexedReference,
    pub role: MemberRole,
}

/// Add a member to a guild
pub fn accept_invitation(ctx: Context<AcceptInvitation>, args: AcceptInvitationArgs) -> Result<()> {
    let guild = &mut ctx.accounts.guild;
    let member_account = &ctx.accounts.member_account;
    let member_address_container = &ctx.accounts.member_address_container;

    // Check if member reference is in the address container
    if assert_indexed_reference(
        args.new_member_refrence.clone(),
        member_address_container.clone(),
        member_account.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::MemberNotFound.into());
    }

    // adding member to the guild
    guild.members.push(Member {
        reference: args.new_member_refrence,
        role: args.role,
    });

    Ok(())
}
