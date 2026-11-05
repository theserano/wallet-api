// An error that knows which HTTP status to send.
// Services throw it; the error handler turns it into a JSON response.
export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
