import * as web3 from "@solana/web3.js";
import { getMembershipLockPda } from "../pdas";
import { createJoinGuildInstruction, JoinGuildArgs as JoinGuildArgsChain, PROGRAM_ID } from "../generated";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

type CreateJoinGuildCtx = {
    args: JoinGuildArgsChain
    project: web3.PublicKey,
    guild_kit: web3.PublicKey,
    guild: web3.PublicKey,
    member: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    payer: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function joinGuildCtx(args: CreateJoinGuildCtx): OperationCtx {

    const programId = args.programId || PROGRAM_ID;

    // PDAS
    const [membershipLock] = getMembershipLockPda(programId, args.guild, args.memberNftMint);
    const [memberAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.newMemberRefrence.addressContainerIndex);
    const memberAccount = getAssociatedTokenAddressSync(
        args.memberNftMint,
        args.member,
    )

    const instructions: web3.TransactionInstruction[] = [
        createJoinGuildInstruction({
            guild: args.guild,
            guildKit: args.guild_kit,
            project: args.project,
            memberAddressContainer,
            memberAccount,
            payer: args.payer,
            membershipLock,
            vault: VAULT,
        }, {
            args: args.args
        })
    ]

    return {
        ...createCtx(instructions),
    };
}

export type joinGuildArgs = {
    args: JoinGuildArgsChain
    memberNftMint: web3.PublicKey,
    guild: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function joinGuild(honeycomb: Honeycomb, args: joinGuildArgs) {
    const ctx = joinGuildCtx({
        ...args,
        project: honeycomb.project().projectAddress,
        guild_kit: honeycomb.guildKit().guildKitAddress,
        member: honeycomb.identity().publicKey,
        payer: honeycomb.identity().publicKey,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
    };
}