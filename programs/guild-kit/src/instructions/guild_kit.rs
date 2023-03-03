use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Token},
    hpl_hive_control::{
        program::HplHiveControl,
        state::{DelegateAuthority, Project},
    },
};

/// Accounts used in create guild_kit instruction
#[derive(Accounts)]
pub struct CreateGuildKit<'info> {
    /// Unique identifier for the guild
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub kit_key: AccountInfo<'info>,

    /// GuildKit state account
    #[account(
      init, 
      payer = payer,
      space = GuildKit::LEN,
      seeds = [
        b"guild_kit".as_ref(),
        project.key().as_ref(),
        kit_key.key().as_ref(),
      ],
      bump
    )]
    pub guild_kit: Box<Account<'info, GuildKit>>,

    /// HIVE CONTROL
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// The wallet that holds the authority over the assembler
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

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

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,
}

// #[derive(AnchorSerialize, AnchorDeserialize, Clone)]
// pub struct CreateGuildKitArgs {}

/// Create a new guild_kit
pub fn create_guild_kit(ctx: Context<CreateGuildKit>) -> Result<()> {
    let guild_kit = &mut ctx.accounts.guild_kit;

    guild_kit.set_defaults();
    guild_kit.project = ctx.accounts.project.key();
    guild_kit.bump = ctx.bumps["guild_kit"];

    Ok(())
}
