import { Query } from "mongoose";
import { excludeField } from "./constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }
  filter(): this {
    const filter = { ...this.query };

    for (const field of excludeField) {
      delete filter[field];
    }

    this.modelQuery = this.modelQuery.find(filter); // parcel.find().find(filter)

    return this;
  }

  search(searchableField: string[]): this {
    const search = this.query.search || "";
    const searchQuery = {
      $or: searchableField.map((field) => ({ [field]: { $regex: search, $options: "i" } })),
    };
    this.modelQuery = this.modelQuery.find(searchQuery);
    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }
  fields(): this {
    const fields = this.query.fields?.split("_").join(" ") || "";
    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }
  pagination(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const totalTours = await this.modelQuery.model.countDocuments();

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    const totalPage = Math.ceil(totalTours / limit);

    return { page, limit, totalPage, total: totalTours };
  }
}
