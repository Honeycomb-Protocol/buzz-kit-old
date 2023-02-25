use crate::errors::ErrorCode;
use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Token, TokenAccount},
    hpl_hive_control::state::{AddressContainer, AddressContainerRole, Project},
};
// ACCEPT INVITATION INSTRUCTION
#[derive(Accounts)]
#[instruction(args: AcceptMemberArgs)]
pub struct AcceptMember<'info> {
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
    #[account(
        seeds = [
            b"address_container".as_ref(),
            format!("{:?}", AddressContainerRole::ProjectMints).as_bytes(),
            project.key().as_ref(), &[args.new_member_refrence.address_container_index
        ]],
        bump = member_address_container.bump
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

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// SYSTEM PROGRAM
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AcceptMemberArgs {
    pub new_member_refrence: IndexedReference,
    pub role: MemberRole,
}

/// Add a member to a guild
pub fn accept_member(ctx: Context<AcceptMember>, args: AcceptMemberArgs) -> Result<()> {
    let guild = &mut ctx.accounts.guild;
    let member_account = &ctx.accounts.member_account;
    let member_address_container = &ctx.accounts.member_address_container;

    // Check if member reference is in the address container
    if member_address_container.addresses[args.new_member_refrence.address_container_index as usize]
        != member_account.mint
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
