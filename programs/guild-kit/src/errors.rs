use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Opertaion overflowed")]
    Overflow,

    #[msg("the member refrence is not valid")]
    MemberRefrenceVerificationFailed,

    #[msg("the member refrence can not be found in the guild")]
    MemberNotFound,

    #[msg("the chief refrence can not be found in the guild")]
    ChiefNotFound,
}
