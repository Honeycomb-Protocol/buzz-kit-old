pub mod assertion;
pub mod errors;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("38foo9CSfPiPZTBvNhouNaYpvkzKEzWW396PUW2GKPVA");

#[program]
pub mod hpl_buzz_guild_kit {
    use super::*;

    // GUILD KIT
    pub fn create_guild_kit(ctx: Context<CreateGuildKit>, args: CreateGuildKitArgs) -> Result<()> {
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

        instructions::create_guild_kit(ctx, args)
    }

    // GUILD
    pub fn create_guild(ctx: Context<CreateGuild>, args: CreateGuildArgs) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_low,
            None,
            &ctx.accounts.project,
            ctx.accounts.payer.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::create_guild(ctx, args)
    }

    pub fn update_guild_info(
        ctx: Context<UpdateGuildInfo>,
        args: UpdateGuildNameArgs,
    ) -> Result<()> {
        instructions::update_guild_info(ctx, args)
    }

    pub fn update_member_role(
        ctx: Context<UpdateGuildInfo>,
        args: UpdateMemberRoleArgs,
    ) -> Result<()> {
        instructions::update_member_role(ctx, args)
    }

    // INVITATIONS
    pub fn send_invitation(ctx: Context<SendInvitation>, args: SendInvitationArgs) -> Result<()> {
        instructions::send_invitation(ctx, args)
    }

    pub fn accept_invitation(
        ctx: Context<AcceptInvitation>,
        args: AcceptInvitationArgs,
    ) -> Result<()> {
        instructions::accept_invitation(ctx, args)
    }

    // REQUESTS
    pub fn create_request(ctx: Context<CreateRequest>, args: CreateRequestArgs) -> Result<()> {
        instructions::create_request(ctx, args)
    }

    pub fn accept_request(ctx: Context<AcceptRequest>, args: AcceptRequestArgs) -> Result<()> {
        instructions::accept_request(ctx, args)
    }

    // PUBLIC JOINING
    pub fn join_guild(ctx: Context<JoinGuild>, args: JoinGuildArgs) -> Result<()> {
        instructions::join_guild(ctx, args)
    }

    // REMOVE MEMBER
    pub fn remove_member(ctx: Context<Remove>, args: RemoveArgs) -> Result<()> {
        instructions::remove_member(ctx, args)
    }
}
