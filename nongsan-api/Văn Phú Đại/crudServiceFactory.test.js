const { InMemoryRepository } = require("../src/repositories/inMemoryRepository");
const { buildCrudService } = require("../src/services/crudServiceFactory");

function createService(seed = [{ id: 1, name: "Seed" }]) {
  const repository = new InMemoryRepository(seed);
  return buildCrudService({
    resourceName: "Item",
    repository,
    schemas: {},
  });
}

describe("CRUD service factory", () => {
  test("getAll returns all existing items", async () => {
    const service = createService([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);

    const data = await service.getAll();

    expect(data).toHaveLength(2);
    expect(data[0].name).toBe("A");
  });

  test("getById returns one item when id exists", async () => {
    const service = createService([{ id: 10, name: "Only" }]);

    const item = await service.getById(10);

    expect(item).toEqual({ id: 10, name: "Only" });
  });

  test("getById throws 404 when id does not exist", async () => {
    const service = createService();

    await expect(service.getById(999)).rejects.toMatchObject({
      status: 404,
      message: "Item with id 999 not found",
    });
  });

  test("create inserts and returns new item", async () => {
    const service = createService();

    const created = await service.create({ name: "Created" });

    expect(created).toMatchObject({ id: 2, name: "Created" });
  });

  test("update changes target item", async () => {
    const service = createService([{ id: 1, name: "Before" }]);

    const updated = await service.update(1, { name: "After" });

    expect(updated).toEqual({ id: 1, name: "After" });
  });

  test("update throws 404 when target item missing", async () => {
    const service = createService([{ id: 1, name: "A" }]);

    await expect(service.update(999, { name: "Nope" })).rejects.toMatchObject({
      status: 404,
      message: "Item with id 999 not found",
    });
  });

  test("remove deletes and returns deleted item", async () => {
    const service = createService([{ id: 1, name: "DeleteMe" }]);

    const deleted = await service.remove(1);

    expect(deleted).toEqual({ id: 1, name: "DeleteMe" });
    await expect(service.getById(1)).rejects.toMatchObject({ status: 404 });
  });
});
