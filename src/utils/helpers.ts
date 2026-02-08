// Utility functions

export const formatResponse = (success: boolean, data: any, message: string = '') => {
    return {
        success,
        message,
        data
    };
};

export const validateHexColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
};

export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
