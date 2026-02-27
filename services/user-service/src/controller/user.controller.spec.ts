import { User } from "../entities/user.entity";

jest.mock("../service/user.service", () => ({
  UserService: class UserService {},
}));

const { UserController } = require("./user.controller");

const makeUser = (): User =>
  ({
    id: "u-1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    password: "hashed-password",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  }) as User;

describe("UserController", () => {
  const mockUserService = {
    CreateUser: jest.fn(),
    getUserById: jest.fn(),
    validateUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const controller = new UserController(mockUserService as any);
  const callback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("CreateUser returns mapped response", async () => {
    const user = makeUser();
    mockUserService.CreateUser.mockResolvedValue(user);

    await controller.CreateUser(
      {
        request: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: "password123",
        },
      },
      callback,
    );

    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        id: user.id,
        email: user.email,
      }),
    );
  });

  it("GetUser returns not found grpc error", async () => {
    mockUserService.getUserById.mockResolvedValue(null);

    await controller.GetUser({ request: { id: "missing" } }, callback);

    expect(callback).toHaveBeenCalledWith({ code: 5, message: "User not found" });
  });

  it("ValidateUser returns valid false when credentials are invalid", async () => {
    mockUserService.validateUser.mockResolvedValue(null);

    await controller.ValidateUser(
      { request: { email: "john@example.com", password: "bad-password" } },
      callback,
    );

    expect(callback).toHaveBeenCalledWith(null, { valid: false });
  });

  it("ValidateUser returns user payload when credentials are valid", async () => {
    const user = makeUser();
    mockUserService.validateUser.mockResolvedValue(user);

    await controller.ValidateUser(
      { request: { email: "john@example.com", password: "password123" } },
      callback,
    );

    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        valid: true,
        user: expect.objectContaining({ id: user.id, email: user.email }),
      }),
    );
  });

  it("UpdateUser returns not found grpc error", async () => {
    mockUserService.updateUser.mockResolvedValue(null);

    await controller.UpdateUser(
      { request: { id: "missing", firstName: "Nope", lastName: "Nope" } },
      callback,
    );

    expect(callback).toHaveBeenCalledWith({ code: 5, message: "User not found" });
  });

  it("DeleteUser returns success response", async () => {
    mockUserService.deleteUser.mockResolvedValue(true);

    await controller.DeleteUser({ request: { id: "u-1" } }, callback);

    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });
});
