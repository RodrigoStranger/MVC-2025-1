import { Session, SessionData } from 'express-session';

declare global {
  namespace Express {
    interface Request {
      session: Session & {
        messages: { [key: string]: any };
      };
      flash(type: string, message?: string): string | string[] | void;
    }

    interface Response {
      locals: {
        success_msg?: string | string[];
        error_msg?: string | string[];
        errors?: any[];
        [key: string]: any;
      };
    }
  }
}

export {};
