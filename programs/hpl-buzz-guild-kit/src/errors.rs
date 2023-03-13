use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Opertaion overflowed")]
    Overflow,

    #[msg("the member refrence is not valid")]
    MemberRefrenceVerificationFailed,

    #[msg("the chief is not valid")]
    InvalidChief,

    #[msg("the member refrence can not be found in the conntainers")]
    MemberNotFound,

    #[msg("the chief refrence can not be found in the conntainers")]
    ChiefNotFound,

    #[msg("the address container is not valid")]
    InvalidAddressContainer,
}
