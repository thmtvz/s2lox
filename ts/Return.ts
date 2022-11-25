import S2ltype from "S2ltype";

export default class Return extends Error{
    constructor(
	public value: S2ltype
    ) {}
}
