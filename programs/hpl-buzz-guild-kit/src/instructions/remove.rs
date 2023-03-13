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
#[instruction(args: RemoveArgs)]
pub struct Remove<'info> {
    /// GUILD KIT
    #[account(has_one = project)]
    pub guild_kit: Box<Account<'info, GuildKit>>,

    /// Guild state account
    #[account(mut, has_one = guild_kit)]
    pub guild: Box<Account<'info, Guild>>,

    /// PROJECT
    #[account()]
    pub project: Box<Account<'info, Project>>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = 
        chief_address_container.role == AddressContainerRole::ProjectMints 
        && chief_address_container.associated_with == project.key())]
    pub chief_address_container: Account<'info, AddressContainer>,

    /// Verify the owner of the mint
    #[account(mut, constraint= chief_account.amount > 0 as u64)]
    pub chief_account: Account<'info, TokenAccount>,

    /// the chief account that invited
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub member: AccountInfo<'info>,

    /// PDA FOR verifying membership & locking mebership
    #[account(
        mut,
        close = member,
    )]
    pub membership_lock: Account<'info, MembershipLock>,

    /// the payer of the transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// RENT SYSVAR
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// system program  
    pub system_program: Program<'info, System>,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, PartialEq)]
pub struct RemoveArgs {
    pub chief_member_refrence: IndexedReference,
    pub new_member_refrence: IndexedReference,
}
pub fn remove_member(ctx: Context<Remove>, args: RemoveArgs) -> Result<()> {
    let guild = &mut ctx.accounts.guild;

    // CHIEF & MEMBER ACCOUNTS & ADDRESS CONTAINERS
    let chief_account = &ctx.accounts.chief_account;
    let chief_address_container = &ctx.accounts.chief_address_container;

    // Check if member reference is in the address container
    if !assert_indexed_reference(
        &args.chief_member_refrence,
        chief_address_container,
        chief_account.mint,
    )
    .unwrap()
    {
        return Err(ErrorCode::InvalidChief.into());
    }

    // GET MEMBER INDEX IN GUILD
    let member_index = guild
        .members
        .iter()
        .position(|member| member.reference == args.new_member_refrence)
        .ok_or(ErrorCode::MemberNotFound)?;

    // Remove member from guild
    guild.members.remove(member_index);

    Ok(())
}
