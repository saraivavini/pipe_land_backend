import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";

import { AppError } from "@shared/errors/AppError";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { CreateSessionUseCase } from "./CreateSessionUseCase";

let fakeUsersRepository: IUsersRepository;
let createSessionUseCase: CreateSessionUseCase;
let createUserUseCase: CreateUserUseCase;

describe("CreateSessionUseCase", () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    createUserUseCase = new CreateUserUseCase(fakeUsersRepository);
    createSessionUseCase = new CreateSessionUseCase(fakeUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const email = "johndoe@example.com";
    const password = "1234";
    await createUserUseCase.execute({
      email,
      name: "John Doe",
      password,
      role: "TEACHER",
    });

    const authenticatedUser = await createSessionUseCase.execute({
      email,
      password,
    });

    expect(authenticatedUser).toHaveProperty("token");
  });

  it("should no be able to authenticate user with incorrect email", async () => {
    const email = "johndoe@example.com";
    const password = "1234";

    await createUserUseCase.execute({
      email,
      name: "John Doe",
      password,
      role: "TEACHER",
    });

    await expect(
      createSessionUseCase.execute({
        email: "incorrect@email.com",
        password,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should no be able to authenticate user with incorrect password", async () => {
    const email = "johndoe@example.com";
    const password = "1234";

    await createUserUseCase.execute({
      email,
      name: "John Doe",
      password,
      role: "TEACHER",
    });

    await expect(
      createSessionUseCase.execute({
        email,
        password: "incorrect_password",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
