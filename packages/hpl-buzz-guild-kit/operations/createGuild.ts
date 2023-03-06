import * as web3 from "@solana/web3.js"
import * as splToken from "@solana/spl-token";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { getGuildPda, getMembershipLockPda } from "../pdas";
import { createCreateGuildInstruction, PROGRAM_ID, CreateGuildArgs as CreateGuildArgsChain } from "../generated";

type CreateCreateGuildCtx = {
    args: CreateGuildArgsChain,
    project: web3.PublicKey,
    guildKit: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    authority: web3.PublicKey,
    payer: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function createGuildCtx(args: CreateCreateGuildCtx): OperationCtx & { guild: web3.PublicKey } {
    const programId = args.programId || PROGRAM_ID;
    const guildId = web3.Keypair.generate().publicKey;

    // PDAS
    const [guild] = getGuildPda(programId, args.guildKit, guildId);
    const [membershipLock] = getMembershipLockPda(programId, guildId, args.chiefNftMint);
    const [addressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.chiefRefrence.addressContainerIndex);
    const chiefAccount = splToken.getAssociatedTokenAddressSync(
        args.chiefNftMint,
        args.authority
    );

    const instructions: web3.TransactionInstruction[] = [
        createCreateGuildInstruction({
            guildId,
            guild,
            project: args.project,
            guildKit: args.guildKit,
            authority: args.authority,
            payer: args.payer,
            addressContainer,
            chiefAccount,
            membershipLock: membershipLock,
            rentSysvar: web3.SYSVAR_RENT_PUBKEY,
            vault: VAULT,
        }, {
            args: args.args
        })
    ]

    return {
        ...createCtx(instructions),
        guild: guild,
    };
}

export type createGuildArgs = {
    args: CreateGuildArgsChain,
    chiefNftMint: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function createGuild(honeycomb: Honeycomb, args: createGuildArgs) {
    const ctx = createGuildCtx({
        args: args.args,
        chiefNftMint: args.chiefNftMint,
        project: honeycomb.project().projectAddress,
        guildKit: honeycomb.guildKit().guildKitAddress,
        authority: honeycomb.identity().publicKey,
        payer: honeycomb.identity().publicKey,
        programId: args.programId,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
        guildAddress: ctx.guild,
    };
}