import { Honeycomb, Module } from "@honeycomb-protocol/hive-control";
import { Connection, PublicKey } from "@solana/web3.js";
import { GuildKit } from './generated/accounts/GuildKit';
import { createGuildKit } from "./operations/createGuildKit";
import { createGuild } from "./operations";
import { BuzzGuild } from "./BuzzGuild";
import {
    CreateGuildArgs as CreateGuildArgsChain,
    Guild,
    IndexedReference,
    MemberRole,
    PROGRAM_ID,
    Request,
} from "./generated";

declare module "@honeycomb-protocol/hive-control" {
    interface Honeycomb {
        guildKit(): BuzzGuildKit;
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
    private _fetch: BuzzGuildKitFetch;
    private _guilds: { [key: string]: BuzzGuild } = {};

    constructor(readonly guildKitAddress: PublicKey,
        private _guildKit: GuildKit,
    ) {
        this._create = new BuzzGuildKitCreate(this);
        this._fetch = new BuzzGuildKitFetch(this);
    }

    static async fromAddress(connection: Connection, address: PublicKey) {
        const guildKit = await GuildKit.fromAccountAddress(connection, address);
        return new BuzzGuildKit(address, guildKit);
    }

    public static async new(honeycomb: Honeycomb) {
        return createGuildKit(honeycomb, {
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

    public fetch() {
        return this._fetch;
    }

    public guild(guild: PublicKey) {
        return this._guilds[guild.toBase58()];
    }

    public loadGuilds() {
        return this._fetch.guilds().then(guilds => {
            this._guilds = guilds.reduce((acc, g) => {
                acc[g.guildAddress.toString()] = g;
                return acc;
            }, {} as { [key: string]: BuzzGuild });
            return this._guilds;
        })
    }

    public addGuild(guild: BuzzGuild) {
        this._guilds[guild.guildAddress.toString()] = guild;
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

    public guild(args: CreateGuildArgs) {
        return createGuild(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        })
            .then(({ guildAddress }) => this._guildKit.fetch().guild(guildAddress))
            .then(x => {
                this._guildKit.addGuild(x);
                return x;
            });
    }

}


export class BuzzGuildKitFetch {
    constructor(private _guildKit: BuzzGuildKit) { }

    public guild(address: PublicKey) {
        return Guild.fromAccountAddress(this._guildKit.honeycomb().connection, address)
            .then(g => new BuzzGuild(this._guildKit, address, g));
    }

    public guilds() {
        return Guild.gpaBuilder()
            .addFilter("guildKit", this._guildKit.guildKitAddress)

            .run(this._guildKit.honeycomb().connection)
            .then(g => g.map(g => {
                try { return new BuzzGuild(this._guildKit, g.pubkey, Guild.fromAccountInfo(g.account)[0]) } catch { }
            }).filter(x => !!x) as BuzzGuild[])
    }

    public fetchGuildsByChief(members: IndexedReference[]) {
        return Guild.gpaBuilder()
            .addFilter("members", members.map(m => {
                return {
                    reference: m,
                    role: MemberRole.Chief,
                }
            }))
    }

    public fetchGuildsByMembers(members: IndexedReference[]) {
        return Guild.gpaBuilder()
            .addFilter("members", members.map(m => {
                return {
                    reference: m,
                    role: MemberRole.Member,
                }
            }))
    }

    public myRequest(member: IndexedReference) {
        return Request.gpaBuilder()
            .addFilter("requestedBy", member)
    }
}

export const buzzGuildKitModule = (
    honeycomb: Honeycomb,
    args: PublicKey
) => BuzzGuildKit.fromAddress(honeycomb.connection, args)
