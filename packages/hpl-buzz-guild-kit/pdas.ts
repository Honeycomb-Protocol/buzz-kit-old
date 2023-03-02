import * as web3 from "@solana/web3.js";
import { PROGRAM_ID } from "./generated";

export const getGuildKitPda = (programId: web3.PublicKey = PROGRAM_ID) => web3.PublicKey.findProgramAddressSync([Buffer.from("guild_kit")], programId)

export const getGuildPda = (programId: web3.PublicKey = PROGRAM_ID) => web3.PublicKey.findProgramAddressSync([Buffer.from("guild")], programId)

export const getMembershipLockPda = (programId: web3.PublicKey = PROGRAM_ID) => web3.PublicKey.findProgramAddressSync([Buffer.from("membership_lock")], programId)

export const getRequestPda = (programId: web3.PublicKey = PROGRAM_ID) => web3.PublicKey.findProgramAddressSync([Buffer.from("request")], programId)

export const getInvitationPda = (programId: web3.PublicKey = PROGRAM_ID) => web3.PublicKey.findProgramAddressSync([Buffer.from("invitation")], programId)