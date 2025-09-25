import { BookCopyStatus } from "../dto/bookCopy.dto";
import { CustomError } from "../middlewares/errorHandler";
import { Author } from "../models/author.model";
import { Book } from "../models/book.model";
import { BookCopy } from "../models/bookCopy.model";
import { BookService } from "./book.service";

export class BookCopyService {

   readonly include =  {
    include: [
      {
        model: Book,
        as: "book",
        include: [
          {
            model: Author,
            as: "author",
          },
        ],
      },
    ],
  };
  public bookService = new BookService();

  public async getAllBookCopies(): Promise<BookCopy[]> {
    return BookCopy.findAll(this.include);
  }

  public async getBookCopyById(id: number): Promise<BookCopy | null> {
    return BookCopy.findByPk(id, this.include);
  }

  public async createBookCopy(
    bookId: number,
    available: boolean,
    state: BookCopyStatus
  ): Promise<BookCopy> {
    let book: Book | null = await this.bookService.getBookById(
      bookId
    );
    if (book === null) {
      let error: CustomError = new Error(`Book ${bookId} not found`);
      error.status = 404;
      throw error;
    }
    return BookCopy.create({ bookId, available, state });
  }

  public async updateBookCopy(
    id: number,
    bookId?: number,
    available?: boolean,
    state?: BookCopyStatus
  ): Promise<BookCopy> {
    let bookCopy = await this.getBookCopyById(id);
    if (bookCopy === null) {
      // Cette erreur pourrait être levée directement dans le contrôleur pour garder une cohérence de code
      // Possibilité de gérer les erreurs dans le contrôleur ou le service selon les choix de
      let error: CustomError = new Error(`BookCopy ${id} not found`);
      error.status = 404;
      throw error;
    } else {
      if (bookId !== undefined) {
        let book = await this.bookService.getBookById(bookId);
        if (book === null) {
          let error: CustomError = new Error(`Book ${bookId} not found`);
          error.status = 404;
          throw error;
        }
      }

      if (available !== undefined) {
        bookCopy.available = available;
      }

      if (state !== undefined) {
        bookCopy.state = state;
      }

      return bookCopy.save();
    }
  }

  public async deleteBookCopy(id: number): Promise<void> {
    await BookCopy.destroy({ where: { id } });
  }
}

export const bookCopyService = new BookCopyService();
