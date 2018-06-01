import { LiveEvent } from "../live-event";

describe("LiveEvent model", () => {
    describe("the constructor", () => {
        [
            ["cache add", { id: "some-id" } as any],
            ["cache remove", { id: "some-id" } as any],
            ["queue shift", { id: "some-id" } as any],
            ["queue push", { id: "some-id" } as any],
            ["queue clear"],
            [
                "init",
                [
                    { id: "some-id-1" } as any,
                    { id: "some-id-2" } as any,
                ],
                [
                    { id: "some-id-1" } as any,
                    { id: "some-id-2" } as any,
                ],
            ],
            [],
        ].forEach(args => {
            it(`constructs the expected object with arguments "${JSON.stringify(args)}"`, () => {
                expect(new LiveEvent(args[0], args[1], args[3])).toMatchSnapshot();
            });
        });
    });
});
