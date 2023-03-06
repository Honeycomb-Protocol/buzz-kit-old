import * as web3 from "@solana/web3.js";
import { PROGRAM_ID } from "./generated";

export const getGuildKitPda = (
    programId: web3.PublicKey = PROGRAM_ID,
    project: web3.PublicKey,
    kitKey: web3.PublicKey
) => web3.PublicKey.findProgramAddressSync([
    Buffer.from("guild_kit"),
    project.toBuffer(),
    kitKey.toBuffer(),
], programId)

export const getGuildPda = (
    programId: web3.PublicKey = PROGRAM_ID,
    kitKey: web3.PublicKey,
    guild_id: web3.PublicKey
) => web3.PublicKey.findProgramAddressSync([
    Buffer.from("guild"),
    kitKey.toBuffer(),
    guild_id.toBuffer(),
], programId)

export const getMembershipLockPda = (
    programId: web3.PublicKey = PROGRAM_ID,
    guild: web3.PublicKey,
    chiefNftMint: web3.PublicKey
) => web3.PublicKey.findProgramAddressSync([
    Buffer.from("membership_lock"),
    guild.toBuffer(),
    chiefNftMint.toBuffer(),
], programId)

export const getRequestPda = (
    programId: web3.PublicKey = PROGRAM_ID,
    guild: web3.PublicKey,
    request: web3.PublicKey
) =>
    web3.PublicKey.findProgramAddressSync([
        Buffer.from("request"),
        guild.toBuffer(),
        request.toBuffer(),
    ], programId)

export const getInvitationPda = (
    programId: web3.PublicKey = PROGRAM_ID,
    guild: web3.PublicKey,
    invitation: web3.PublicKey
) => web3.PublicKey.findProgramAddressSync(
    [
        Buffer.from("invitation"),
        guild.toBuffer(),
        invitation.toBuffer(),
    ], programId)