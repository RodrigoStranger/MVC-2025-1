import { create } from 'express-handlebars';

export const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/',
    helpers: {
        // Formatear fechas
        formatDate: (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        // Comparación de valores (para condicionales)
        eq: (a: any, b: any) => a === b,
        // Sumar valores
        add: (a: number, b: number) => a + b,
        // Obtener el año actual
        currentYear: () => new Date().getFullYear()
    }
});

export default hbs;
