import * as web3 from "@solana/web3.js";
import { createGuild } from "./operations";
import { GuildKit } from './generated/accounts/GuildKit';
import { createGuildKit } from "./operations/createGuildKit";
import { AddressContainer, Honeycomb, Module } from "@honeycomb-protocol/hive-control";
import { Guild, GuildVisibility, CreateGuildArgs as CreateGuildArgsChain, JoiningCriteria, Member, PROGRAM_ID } from "./generated";
import { updateGuild } from "./operations/updateGuildInfo";

declare module "@honeycomb-protocol/hive-control" {
    interface Honeycomb {
        guildKit: () => BuzzGuildKit;
    }
}

type CreateGuildArgs = {
    args: CreateGuildArgsChain,
    chiefNftMint: web3.PublicKey,
}

export class BuzzGuildKit implements Module {
    readonly programId = PROGRAM_ID;
    private _honeycomb: Honeycomb;
    private _create: BuzzGuildKitCreate;
    private _guilds: BuzzGuild[] = [];

    constructor(readonly guildKitAddress: web3.PublicKey,
        private _guildKit: GuildKit,
    ) {
        this._create = new BuzzGuildKitCreate(this);
    }

    static async fromAddress(connection: web3.Connection, address: web3.PublicKey) {
        const guildKit = await GuildKit.fromAccountAddress(connection, address);
        return new BuzzGuildKit(address, guildKit);
    }

    public static async new(honeycomb: Honeycomb) {
        createGuildKit(honeycomb, {
            programId: PROGRAM_ID,
        });
    }

    public honeycomb() {
        return this._honeycomb;
    }

    public guildKit() {
        return this._guildKit;
    }

    public create() {
        return this._create;
    }

    public addGuild(guild: BuzzGuild) {
        this._guilds.push(guild);
    }

    install(honeycomb: Honeycomb) {
        this._honeycomb = honeycomb;
        honeycomb.guildKit = () => this;
        return honeycomb;
    }
}

export class BuzzGuildKitCreate {

    constructor(
        private _guildKit: BuzzGuildKit,
    ) { }

    public guildKit() {
        return this._guildKit;
    }

    public guild(args: CreateGuildArgs) {
        return createGuild(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        }).then(
            res => BuzzGuild.fromAddress(this._guildKit, res.guildAddress)
        ).then(guild => {
            this._guildKit.addGuild(guild);
            return guild;
        });
    }

}

export class BuzzGuild {
    public readonly guildId: web3.PublicKey
    public readonly bump: number
    public readonly project: web3.PublicKey
    public readonly name: string
    public readonly members: Member[]
    public readonly visibility: GuildVisibility
    public readonly joiningCriteria: JoiningCriteria

    constructor(private _guildKit: BuzzGuildKit, private _guild: Guild) {
        this.guildId = _guild.guildId;
        this.bump = _guild.bump;
        this.project = _guild.project;
        this.name = _guild.name;
        this.members = _guild.members;
        this.visibility = _guild.visibility;
        this.joiningCriteria = _guild.joiningCriteria;
    }

    public guildKit() {
        return this._guildKit;
    }

    public guild() {
        return this._guild;
    }

    // public update_guild_info({
    //     name,
    //     visibility,
    //     joiningCriteria,
    // }) {
    //     updateGuild(this._guildKit.honeycomb(), {
    //         guildId: this.guildId,
    //         args: {
    //             name,
    //             visibility,
    //             joiningCriteria,

    //         }
    //     })
    // }

    static async fromAddress(guildKit: BuzzGuildKit, address: web3.PublicKey) {
        const guild = await Guild.fromAccountAddress(guildKit.honeycomb().connection, address);
        return new BuzzGuild(guildKit, guild);
    }

}