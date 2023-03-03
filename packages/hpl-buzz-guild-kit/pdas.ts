import * as web3 from "@solana/web3.js";
import { PROGRAM_ID } from "./generated";

export const getGuildKitPda = (programId: web3.PublicKey = PROGRAM_ID,
    project: web3.PublicKey,
    kitKey: web3.PublicKey
) => web3.PublicKey.findProgramAddressSync([
    Buffer.from("guild_kit"),
    project.toBytes(),
    kitKey.toBytes(),
], programId)

export const getGuildPda = (programId: web3.PublicKey = PROGRAM_ID,
    kitKey: web3.PublicKey,
    guild_id: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync([
        Buffer.from("guild"),
        kitKey.toBytes(),
        guild_id.toBytes(),
    ], programId)

export const getMembershipLockPda = (programId: web3.PublicKey = PROGRAM_ID,
    project: web3.PublicKey,
    chiefNftMint: web3.PublicKey
) => web3.PublicKey.findProgramAddressSync([
    Buffer.from("membership_lock"),
    project.toBytes(),
    chiefNftMint.toBytes(),
], programId)

export const getRequestPda = (programId: web3.PublicKey = PROGRAM_ID) => web3.PublicKey.findProgramAddressSync([Buffer.from("request")], programId)

export const getInvitationPda = (programId: web3.PublicKey = PROGRAM_ID) => web3.PublicKey.findProgramAddressSync([Buffer.from("invitation")], programId)