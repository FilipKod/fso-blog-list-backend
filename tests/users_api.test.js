const { beforeEach, after, describe, test } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = require("../app");
const helper = require("./test_helper");

const User = require("../models/user");

const api = supertest(app);

describe("if there is some users in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const usersToDb = await Promise.all(
      helper.initalUsers.map(async (user) => {
        return {
          username: user.username,
          name: user.name,
          passwordHash: await bcrypt.hash(user.password, 10),
        };
      })
    );

    await User.insertMany(usersToDb);
  });

  describe("addition of new user", () => {
    test("succeeds with valid data", async () => {
      const userTest = {
        username: "uniqueUsername",
        name: "Unique Name",
        password: "absolute unique password",
      };

      await api
        .post("/api/users")
        .send(userTest)
        .expect(201)
        .expect("Content-type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();

      assert.strictEqual(usersAtEnd.length, helper.initalUsers.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);
      assert(usernames.includes(userTest.username));
    });

    test("fails with status code 400 if username is missing", async () => {
      const userTest = {
        name: "unique name",
        password: "superpassword",
      };

      const result = await api
        .post("/api/users")
        .send(userTest)
        .expect(400)
        .expect("Content-type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, helper.initalUsers.length);

      assert(result.body.error.includes("username is required"));
    });

    test("fails with status code 400 if password is missing", async () => {
      const userTest = {
        username: "userforgetpass",
        name: "unique name",
      };

      const result = await api
        .post("/api/users")
        .send(userTest)
        .expect(400)
        .expect("Content-type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, helper.initalUsers.length);

      assert(result.body.error.includes("Password is required."));
    });

    test("fails with status code 409 if username exists", async () => {
      const usersAtStart = await helper.usersInDb();
      const userTest = {
        username: usersAtStart[0].username,
        name: "unique name",
        password: "superpassword",
      };

      const result = await api
        .post("/api/users")
        .send(userTest)
        .expect(409)
        .expect("Content-type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, helper.initalUsers.length);

      assert(result.body.error.includes("username must be unique"));
    });

    test("fails with status code 400 if username is less than 2 characters", async () => {
      const userTest = {
        username: "j",
        name: "unique name",
        password: "superpassword",
      };

      const result = await api
        .post("/api/users")
        .send(userTest)
        .expect(400)
        .expect("Content-type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, helper.initalUsers.length);

      assert(
        result.body.error.includes(
          "Username must contains at least 3 characters."
        )
      );
    });

    test("fails with status code 400 if password is less than 2 characters", async () => {
      const userTest = {
        username: "jasper",
        name: "unique name",
        password: "s",
      };

      const result = await api
        .post("/api/users")
        .send(userTest)
        .expect(400)
        .expect("Content-type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, helper.initalUsers.length);

      assert(
        result.body.error.includes(
          "Password must contains at least 3 characters."
        )
      );
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
