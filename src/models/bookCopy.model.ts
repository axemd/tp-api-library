import { Model } from "sequelize";
import sequelize from "../config/database"; // Connexion à la base de données
import { Book } from "./book.model";

export interface BookCopyAttributes {
  id?: number;
  bookId: number;
  available: boolean;
  state: number;
}

export class BookCopy
  extends Model<BookCopyAttributes>
  implements BookCopyAttributes
{
  public id?: number;
  public bookId!: number;
  public available!: boolean;
  public state!: number;
}

BookCopy.init(
  {
    id: {
      type: "INTEGER",
      autoIncrement: true,
      primaryKey: true,
    },
    bookId: {
      type: "INTEGER",
      allowNull: false,
      field: "book_id",
    },
    available: {
      type: "BOOLEAN",
      allowNull: false,
      defaultValue: true
    },
    state: {
      type: "INTEGER",
      allowNull: false,
      defaultValue: 5
    }
  },
  {
    sequelize,
    tableName: "BookCopy",
  }
);

BookCopy.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(BookCopy, { foreignKey: 'bookId', as: 'copies' });