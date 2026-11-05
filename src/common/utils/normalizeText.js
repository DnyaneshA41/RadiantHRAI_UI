export const normalizeTextInput = (value) => {
    // Remove spaces from the beginning
    return value.replace(/^\s+/, "");
};

export const trimTextInput = (value) => {
    // Remove spaces from beginning and end
    return value.trim();
};