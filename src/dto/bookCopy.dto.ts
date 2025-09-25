export enum BookCopyStatus {
    BROKE,
    BAD,
    NEUTRAL,
    GOOD,
    EXCELLENT,
    NEW
}
export interface BookCopyDTO {
    id?: number;
    bookId: number;
    available: boolean;
    state: BookCopyStatus;
}