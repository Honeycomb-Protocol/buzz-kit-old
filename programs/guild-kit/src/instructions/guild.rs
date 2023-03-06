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

/// Accounts used in create guild instruction
#[derive(Accounts)]
#[instruction(args: CreateGuildArgs)]
pub struct CreateGuild<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub guild_id: AccountInfo<'info>,

    /// Guild state account
    #[account(
      init, 
      payer = payer,
      space = Guild::LEN,
      seeds = [
        b"guild".as_ref(),
        guild_kit.key().as_ref(),
        guild_id.key().as_ref()
      ],
      bump
    )]
    pub guild: Box<Account<'info, Guild>>,

    /// GUILD KIT
    #[account(mut)]
    pub guild_kit: Box<Account<'info, GuildKit>>,

    /// HIVE CONTROL
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = address_container.role == AddressContainerRole::ProjectMints && address_container.associated_with == project.key())]
    pub address_container: Account<'info, AddressContainer>,

    #[account(constraint = chief_account.owner == authority.key() && chief_account.amount >= 0 as u64)]
    pub chief_account: Account<'info, TokenAccount>,

    /// PDA FOR verifying membbership & locking mebership
    #[account(
        init,
          seeds = [
              b"membership_lock".as_ref(),
              guild_id.key().as_ref(),
              chief_account.mint.as_ref()
          ],
          bump,
          payer = payer,
          space = MembershipLock::LEN
      )]
    pub membership_lock: Account<'info, MembershipLock>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    // authority of the guild
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// RENT SYSVAR
    pub rent_sysvar: Sysvar<'info, Rent>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateGuildArgs {
    pub name: String,
    pub chief_refrence: IndexedReference,
    pub visibility: GuildVisibility,
    pub joining_criteria: JoiningCriteria,
}

/// Create a new guild
pub fn create_guild(ctx: Context<CreateGuild>, args: CreateGuildArgs) -> Result<()> {
    msg!("Creating Guild");
    let membership_lock = &mut ctx.accounts.membership_lock;
    let chief_account = &mut ctx.accounts.chief_account;
    let guild = &mut ctx.accounts.guild;
    let address_container = &ctx.accounts.address_container;
    
    
    if !assert_indexed_reference(
        &args.chief_refrence,
        address_container,
        chief_account.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::ChiefNotFound.into());
    }
    
    guild.set_defaults();
    membership_lock.set_defaults();

    // set the guild configs    
    guild.name = args.name;
    guild.members.push(Member {
        role: MemberRole::Chief,
        reference: args.chief_refrence.clone(),
    });
    guild.visibility = args.visibility;
    guild.joining_criteria = args.joining_criteria;
    guild.guild_kit = ctx.accounts.guild_kit.key();
    guild.guild_id = ctx.accounts.guild_id.key();

    // set the membership lock configs
    membership_lock.guild = ctx.accounts.guild.key();
    membership_lock.member_reference = args.chief_refrence;

    msg!("GUILD CREATED");
    Ok(())
}

/// Accounts used in update guild's info context & instructions
#[derive(Accounts)]
pub struct UpdateGuildInfo<'info> {

    /// GUILD KIT
    #[account(has_one = project)]
    pub guild_kit: Box<Account<'info, GuildKit>>,

    /// Guild state account
    #[account(mut, has_one = guild_kit)]
    pub guild: Box<Account<'info, Guild>>,

    /// HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = address_container.role == AddressContainerRole::ProjectMints && address_container.associated_with == project.key())]
    pub address_container: Account<'info, AddressContainer>,

    #[account(constraint = chief_account.owner == authority.key() && chief_account.amount >= 0 as u64)]
    pub chief_account: Account<'info, TokenAccount>,

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
pub struct UpdateGuildNameArgs {
    chief_refrence: IndexedReference,
    pub name: Option<String>,
    pub visibility: Option<GuildVisibility>,
    pub joining_criteria: Option<JoiningCriteria>,
}

/// Update a guild name or description
pub fn update_guild_info(ctx: Context<UpdateGuildInfo>, args: UpdateGuildNameArgs) -> Result<()> {
    let guild = &mut ctx.accounts.guild;
    let chief_account = &mut ctx.accounts.chief_account;
    let address_container = &mut ctx.accounts.address_container;

    if !assert_indexed_reference(
        &args.chief_refrence,
        address_container,
        chief_account.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::MemberRefrenceVerificationFailed.into());
    }

    // Check if the chief reference is valid
    guild
        .members
        .iter()
        .find(|member| member.reference == args.chief_refrence && member.role == MemberRole::Chief)
        .ok_or(ErrorCode::ChiefNotFound)?;

    guild.name = args.name.unwrap_or(guild.name.clone());
    guild.visibility = args.visibility.unwrap_or(guild.visibility.clone());
    guild.joining_criteria = args
        .joining_criteria
        .unwrap_or(guild.joining_criteria.clone());

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateMemberRoleArgs {
    pub chief_refrence: IndexedReference,
    pub member_refrence: IndexedReference,
    pub role: MemberRole,
}

/// Update member role in a guild
pub fn update_member_role(ctx: Context<UpdateGuildInfo>, args: UpdateMemberRoleArgs) -> Result<()> {
    let guild = &mut ctx.accounts.guild;

    // Check if the chief reference is valid
    guild
        .members
        .iter()
        .find(|member| member.reference == args.chief_refrence && member.role == MemberRole::Chief)
        .ok_or(ErrorCode::ChiefNotFound)?;

    // Check if the member reference is valid
    let member = guild
        .members
        .iter_mut()
        .find(|member| member.reference == args.member_refrence)
        .ok_or(ErrorCode::MemberNotFound)?;

    // CHANGING THE ROLE
    member.role = args.role;

    Ok(())
}
