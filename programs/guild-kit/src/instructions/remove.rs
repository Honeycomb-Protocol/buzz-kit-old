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
    /// guild state account
    #[account(mut)]
    pub guild: Box<Account<'info, Guild>>,

    /// PROJECT
    #[account(
        mut,
        constraint = project.key() == guild.project
    )]
    pub project: Box<Account<'info, Project>>,

    /// Address container that stores the mint addresss of the collections
    #[account(constraint = member_address_container.role == AddressContainerRole::ProjectMints && member_address_container.associated_with == project.key())]
    pub member_address_container: Account<'info, AddressContainer>,

    /// Verify the owner of the mint
    #[account(mut, constraint= member_account.amount > 0 as u64)]
    pub member_account: Account<'info, TokenAccount>,

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

    /// TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// system program  
    pub system_program: Program<'info, System>,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, PartialEq)]
pub struct RemoveArgs {
    pub new_member_refrence: IndexedReference,
}
pub fn remove_member(ctx: Context<Remove>, args: RemoveArgs) -> Result<()> {
    let guild = &mut ctx.accounts.guild;

    // CHIEF & MEMBER ACCOUNTS & ADDRESS CONTAINERS
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
