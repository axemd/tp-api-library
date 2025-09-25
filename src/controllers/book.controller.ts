import { Body, Controller, Get, Post, Patch, Route, Tags, Path, Delete, Security } from "tsoa";
import { BookDTO } from "../dto/book.dto";
import { bookService } from "../services/book.service";
import { CustomError } from "../middlewares/errorHandler";
import { Book } from "../models/book.model";
import { toDto } from "../mapper/book.mapper";
import { BookCopyDTO } from "../dto/bookCopy.dto";
import { bookCopyService } from "../services/bookCopy.service";

@Route("books")
@Tags("Books")
export class BookController extends Controller {
  @Security("jwt", ["read"])
  @Get("/")
  public async getAllBooks(): Promise<BookDTO[]> {
    return bookService.getAllBooks();
    }

  @Security("jwt", ["read"])
  @Get("{id}")
  public async getBoodById(id: number): Promise<BookDTO> {
    let book: Book | null = await bookService.getBookById(id); 

    if(book === null) {
      let error: CustomError = new Error(`Book ${id} not found`);
      error.status = 404;
      throw error;
    }

    return toDto(book);
  }

  // Récupère les exemplaires d'un livre
  @Security("jwt", ["read"])
  @Get("{id}/book-copies")
  public async getBookCopies(@Path() id: number): Promise<BookCopyDTO[]> {
    return bookCopyService.getBookCopiesByBookId(id);
  }

  @Security("jwt", ["create:book"])
  @Post("/")
  public async createBook(@Body() requestBody: BookDTO): Promise<BookDTO> {
    let { title, publishYear, author, isbn } = requestBody;
    
    if(author?.id === undefined) {
      let error: CustomError = new Error("Author ID is required to create a book");
      error.status = 400;
      throw error;
    }
    return bookService.createBook(title, publishYear, author?.id, isbn)
  }

  @Security("jwt", ["update:book"])
  @Patch("{id}")
  public async updateBook(@Path() id: number, @Body() requestBody: BookDTO): Promise<BookDTO> {
    let { title, publishYear, author, isbn } = requestBody;

    if(author?.id === undefined) {
      let error: CustomError = new Error("Author ID is required to update a book");
      error.status = 400;
      throw error;
    }

    return bookService.updateBook(id, title, publishYear, author?.id, isbn);
  }

  // Supprime un livre par ID
  @Security("jwt", ["delete:book"])
  @Delete("{id}")
  public async deleteBook(@Path() id: number): Promise<void> {
    await bookService.deleteBook(id);
  }
}