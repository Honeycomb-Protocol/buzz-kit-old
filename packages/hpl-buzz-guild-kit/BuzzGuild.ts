import { Honeycomb, Module } from "@honeycomb-protocol/hive-control";
import { Connection, PublicKey } from "@solana/web3.js";
import { GuildKit } from './generated/accounts/GuildKit';
import { createGuildKit } from "./operations/createGuildKit";
import {
    CreateGuildArgs as CreateGuildArgsChain,
    Guild,
    GuildVisibility,
    JoiningCriteria,
    Member,
    PROGRAM_ID
} from "./generated";
import {
    acceptInvitation,
    AcceptInvitationArgs,
    acceptRequest,
    AcceptRequestArgs,
    createGuild,
    createInvitation,
    CreateInvitationArgs,
    createRequest,
    CreateRequestArgs,
    joinGuild,
    joinGuildArgs,
    updateGuild,
    UpdateGuildInfoArgs,
    updateMemberRole,
    UpdateMemberRoleCtx
} from "./operations";

declare module "@honeycomb-protocol/hive-control" {
    interface Honeycomb {
        guildKit: () => BuzzGuildKit;
    }
}

type CreateGuildArgs = {
    args: CreateGuildArgsChain,
    chiefNftMint: PublicKey,
}

export class BuzzGuildKit implements Module {
    readonly programId = PROGRAM_ID;
    private _honeycomb: Honeycomb;
    private _create: BuzzGuildKitCreate;
    private _guilds: BuzzGuild[] = [];

    constructor(readonly guildKitAddress: PublicKey,
        private _guildKit: GuildKit,
    ) {
        this._create = new BuzzGuildKitCreate(this);
    }

    static async fromAddress(connection: Connection, address: PublicKey) {
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
    public readonly guildId: PublicKey
    public readonly bump: number
    public readonly project: PublicKey
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

    public updateGuildInfo(args: UpdateGuildInfoArgs) {
        return updateGuild(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        })
    }

    public updateMemberRole(args: UpdateMemberRoleCtx) {
        return updateMemberRole(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        })
    }

    public createInvitation(args: CreateInvitationArgs) {
        return createInvitation(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public acceptInvitation(args: AcceptInvitationArgs) {
        return acceptInvitation(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public createRequest(args: CreateRequestArgs) {
        return createRequest(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public acceptRequest(args: AcceptRequestArgs) {
        return acceptRequest(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public joinGuild(args: joinGuildArgs) {
        return joinGuild(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    static async fromAddress(guildKit: BuzzGuildKit, address: PublicKey) {
        const guild = await Guild.fromAccountAddress(guildKit.honeycomb().connection, address);
        return new BuzzGuild(guildKit, guild);
    }

}