pub mod errors;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod hpl_buzz_guild_kit {
    use super::*;

    pub fn create_guild_kit(ctx: Context<CreateGuildKit>) -> Result<()> {
        hpl_hive_control::cpi::add_remove_service(
            CpiContext::new(
                ctx.accounts.hive_control.to_account_info(),
                hpl_hive_control::cpi::accounts::AddRemoveService {
                    project: ctx.accounts.project.to_account_info(),
                    delegate_authority: if let Some(delegate_authority) =
                        &ctx.accounts.delegate_authority
                    {
                        Some(delegate_authority.to_account_info())
                    } else {
                        Some(ctx.accounts.hive_control.to_account_info())
                    },
                    authority: ctx.accounts.authority.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    rent_sysvar: ctx.accounts.rent_sysvar.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    vault: ctx.accounts.vault.to_account_info(),
                },
            ),
            hpl_hive_control::instructions::AddRemoveServiceArgs {
                service: hpl_hive_control::state::Service::GuildKit,
                remove: Some(false),
            },
        )?;

        instructions::create_guild_kit(ctx)
    }

    pub fn create_guild(ctx: Context<CreateGuild>, args: CreateGuildArgs) -> Result<()> {
        hpl_hive_control::instructions::platform_gate(
            hpl_hive_control::constants::ACTIONS.public_low,
            &ctx.accounts.project,
            ctx.accounts.payer.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::create_guild(ctx, args)
    }
}
