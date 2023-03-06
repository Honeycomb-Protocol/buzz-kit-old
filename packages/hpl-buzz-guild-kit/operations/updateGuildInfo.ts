import * as web3 from "@solana/web3.js";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { createUpdateGuildInfoInstruction, UpdateGuildNameArgs as UpdateGuildNameArgsChain } from "../generated";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

type CreateUpdateGuildInfoCtx = {
    args: UpdateGuildNameArgsChain,
    guild: web3.PublicKey,
    project: web3.PublicKey,
    guild_kit: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    payer: web3.PublicKey,
    authority: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function updateGuildCtx(args: CreateUpdateGuildInfoCtx): OperationCtx {

    const [addressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.chiefRefrence.addressContainerIndex);
    const chiefAccount = getAssociatedTokenAddressSync(
        args.chiefNftMint,
        args.authority
    );

    const instructions: web3.TransactionInstruction[] = [
        createUpdateGuildInfoInstruction({
            guild: args.guild,
            guildKit: args.guild_kit,
            project: args.project,
            payer: args.payer,
            authority: args.authority,
            addressContainer,
            chiefAccount,
            vault: VAULT,
        }, {
            args: args.args
        })
    ]

    return {
        ...createCtx(instructions),
    };
}

export type updateGuildInfoArgs = {
    args: UpdateGuildNameArgsChain,
    guild: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function updateGuild(honeycomb: Honeycomb, args: updateGuildInfoArgs) {
    const ctx = updateGuildCtx({
        ...args,
        project: honeycomb.project().projectAddress,
        payer: honeycomb.identity().publicKey,
        authority: honeycomb.identity().publicKey,
        guild_kit: honeycomb.guildKit().guildKitAddress,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
    };
}