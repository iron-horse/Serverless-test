import { menuHandler, cartHandler, calorieCounterHandler } from "..";
import { findCalories } from "../utility/calculate-calories";
import mock4pcChickenData from "../mock-data/4pc-chicken";
import mockCartData from "../mock-data/cart";
import mockPlusData from "../mock-data/plus";
import mockMenuData from "../mock-data/menu";
jest.mock("../utility/calculate-calories");

let parse = JSON.parse.bind(null);
/**
 * These tests only provide a basic assessment of correctness.
 *
 * Feel free to modify as you find necessary.
 */

const jsonParseFailureTest = async (handler: Function, parameters?: any) => {
  JSON.parse = jest.fn().mockImplementation(() => {
    throw new Error("Something went wrong");
  });

  const response = await handler(parameters);

  expect(response).toEqual({
    body: JSON.stringify({
      error: "Sorry could not process your request. Please try again later!",
    }),
    statusCode: 500,
  });
};

describe("Homework", () => {
  const expectedResponseShape = {
    body: expect.any(String),
    statusCode: expect.any(Number),
  };

  describe("Question #1: Menu", () => {
    afterEach(() => {
      JSON.parse = parse;
    });

    it("should return the correct data shape", async () => {
      JSON.parse = jest.fn().mockReturnValue(mockMenuData);
      const response = await menuHandler();

      expect(response).toEqual(expectedResponseShape);
    });

    it("should return with 500", async () => {
      await jsonParseFailureTest(menuHandler);
    });
  });

  describe("Question #2: Cart", () => {
    afterEach(() => {
      JSON.parse = parse;
    });

    it("should return the correct data shape", async () => {
      JSON.parse = jest
        .fn()
        .mockReturnValueOnce(mockCartData)
        .mockReturnValue(mockPlusData);
      const response = await cartHandler();

      expect(response).toEqual(expectedResponseShape);
    });

    it("should return with 500", async () => {
      await jsonParseFailureTest(menuHandler);
    });
  });

  describe("Question #3: Calorie counter", () => {
    let minCalories = 5;
    let maxCalories = 10;

    beforeEach(() => {
      jest.clearAllMocks();
      (findCalories as jest.Mock).mockReturnValue({
        minCalories,
        maxCalories,
      });
    });

    afterEach(() => {
      JSON.parse = parse;
    });

    it("should return the correct data shape", async () => {
      JSON.parse = jest.fn().mockReturnValue(mock4pcChickenData);
      const response = await calorieCounterHandler({
        pathParameters: { menuItem: "4pc-chicken" },
      });

      expect(response).toEqual(expectedResponseShape);
    });

    it("should return min and max calories", async () => {
      JSON.parse = jest.fn().mockReturnValue(mock4pcChickenData);

      /**
       * as we have mocked for each comboItem min and max calory calculation
       * we can calculate what should our handler return.
       * */

      const totalComboItemCount = mock4pcChickenData.comboItems.length;
      const expectedData = {
        minCalories: totalComboItemCount * minCalories,
        maxCalories: totalComboItemCount * maxCalories,
      };

      const response = await calorieCounterHandler({
        pathParameters: { menuItem: "4pc-chicken" },
      });

      expect(response.body).toEqual(JSON.stringify({ data: expectedData }));
    });

    it("should return with 400", async () => {
      const response = await calorieCounterHandler({
        pathParameters: { menuItem: "4pc-Not-found" },
      });

      expect(response).toEqual({
        body: expect.any(String),
        statusCode: 400,
      });
    });

    it("should return with 500", async () => {
      await jsonParseFailureTest(calorieCounterHandler, {
        pathParameters: { menuItem: "4pc-chicken" },
      });
    });
  });
});
