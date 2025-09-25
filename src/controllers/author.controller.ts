import { Controller, Get, Post, Delete, Route, Path, Body, Tags, Patch, Security } from "tsoa";
import { authorService } from "../services/author.service";
import { AuthorDTO } from "../dto/author.dto";
import { Author } from "../models/author.model";
import { CustomError } from "../middlewares/errorHandler";
import { BookDTO } from "../dto/book.dto";
import { bookService } from "../services/book.service";

@Route("authors")
@Tags("Authors")
export class AuthorController extends Controller {
  // Récupère tous les auteurs
  @Security("jwt", ["read"])
  @Get("/")
  public async getAllAuthors(): Promise<AuthorDTO[]> {
    return authorService.getAllAuthors();
  }

  // Récupère un auteur par ID
  @Security("jwt", ["read"])
  @Get("{id}")
  public async getAuthorById(@Path() id: number): Promise<AuthorDTO> {
    let author: Author | null = await authorService.getAuthorById(id);
    if (author === null) {
      let error: CustomError = new Error("Author not found");
      error.status = 404;
      throw error;
    } else {
      return author;
    }
  }

  // Récupère les livres d'un auteur
  @Security("jwt", ["read"])
  @Get("{id}/books")
  public async getBooksByAuthor(@Path() id: number): Promise<BookDTO[]> {
    return bookService.getBooksByAuthorId(id);
  }

  // Crée un nouvel auteur
  @Security("jwt", ["create:author"])
  @Post("/")
  public async createAuthor(
    @Body() requestBody: AuthorDTO
  ): Promise<AuthorDTO> {
    const { firstName, lastName } = requestBody;
    if (!firstName || !lastName) {
      let error: CustomError = new Error(
        "First name and last name are required"
      );
      error.status = 400;
      throw error;
    }
    return authorService.createAuthor(firstName, lastName);
  }

  // Supprime un auteur par ID
  @Security("jwt", ["delete:author"])
  @Delete("{id}")
  public async deleteAuthor(@Path() id: number): Promise<void> {
    try {
      await authorService.deleteAuthor(id);
    } catch (SequelizeForeignKeyConstraintError) {
      let error: CustomError = new Error(
        "Cannot delete author with associated books"
      );
      error.status = 409;
      throw error;
    }
  }

  @Security("jwt", ["update:author"])
  @Patch("{id}")
  public async updateAuthor(
    @Path() id: number,
    @Body() requestBody: AuthorDTO
  ): Promise<AuthorDTO> {
    const { firstName, lastName } = requestBody;
    if (!firstName || !lastName) {
      let error: CustomError = new Error(
        "First name and last name are required"
      );
      error.status = 400;
      throw error;
    }
    let author = await authorService.updateAuthor(id, firstName, lastName);

    if (author === null) {
      let error: CustomError = new Error("Author not found");
      error.status = 404;
      throw error;
    }

    return author;
  }
}
