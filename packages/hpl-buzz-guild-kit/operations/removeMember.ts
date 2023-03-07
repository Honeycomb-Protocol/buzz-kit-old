import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { createRemoveMemberInstruction, RemoveArgs as RemoveArgsChain, PROGRAM_ID, } from "../generated";
import { getMembershipLockPda } from "../pdas";

type CreateJoinGuildCtx = {
    args: RemoveArgsChain
    project: web3.PublicKey,
    guild_kit: web3.PublicKey,
    guild: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    member: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    payer: web3.PublicKey,
    authority: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function removeMemberCtx(args: CreateJoinGuildCtx): OperationCtx {

    const programId = args.programId || PROGRAM_ID;

    // PDAS
    const [membershipLock] = getMembershipLockPda(programId, args.guild, args.memberNftMint);
    const [chiefAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.chiefMemberRefrence.addressContainerIndex);
    const chiefAccount = getAssociatedTokenAddressSync(
        args.chiefNftMint,
        args.authority,
    )

    const instructions: web3.TransactionInstruction[] = [
        createRemoveMemberInstruction({
            guild: args.guild,
            guildKit: args.guild_kit,
            project: args.project,
            chiefAccount,
            chiefAddressContainer,
            member: args.member,
            membershipLock,
            payer: args.payer,
            authority: args.authority,
            vault: VAULT,
        }, {
            args: args.args
        })
    ]

    return {
        ...createCtx(instructions),
    };
}

export type removeMemberArgs = {
    args: RemoveArgsChain
    guild: web3.PublicKey,
    member: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function removeMember(honeycomb: Honeycomb, args: removeMemberArgs) {
    const ctx = removeMemberCtx({
        ...args,
        payer: honeycomb.identity().publicKey,
        authority: honeycomb.identity().publicKey,
        project: honeycomb.project().projectAddress,
        guild_kit: honeycomb.guildKit().guildKitAddress,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
    };
}