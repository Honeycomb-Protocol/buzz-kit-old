use anchor_lang::prelude::*;

#[account]
pub struct Invitation {
    /// the key to identify for the invitation
    pub invitation_id: Pubkey,

    /// the key to identify which guild does it belong to
    pub guild: Pubkey,

    /// the key to identify which chief does it belong to
    pub chief: Pubkey,

    /// the key to identify which member does it belong to
    pub member: Pubkey,
}
impl Invitation {
    pub const LEN: usize = 32 + 32 + 32 + 8;

    pub fn set_defaults(&mut self) {
        self.invitation_id = Pubkey::default();
        self.guild = Pubkey::default();
        self.chief = Pubkey::default();
        self.member = Pubkey::default();
    }
}

pub struct Request {
    /// the key to identify for the request
    pub request_id: Pubkey,

    /// the key to identify which guild does it belong to
    pub guild: Pubkey,

    /// the key to identify which member does it belong to
    pub member: Pubkey,
}
impl Request {
    pub const LEN: usize = 32 + 32 + 8;

    pub fn set_defaults(&mut self) {
        self.request_id = Pubkey::default();
        self.guild = Pubkey::default();
        self.member = Pubkey::default();
    }
}
