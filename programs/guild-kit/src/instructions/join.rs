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

// ACCEPT INVITATION INSTRUCTION
#[derive(Accounts)]
#[instruction(args: JoinGuildArgs)]
pub struct JoinGuild<'info> {
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
pub struct JoinGuildArgs {
    pub new_member_refrence: IndexedReference,
}

/// Add a member to a guild
pub fn join_guild(ctx: Context<JoinGuild>, args: JoinGuildArgs) -> Result<()> {
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
