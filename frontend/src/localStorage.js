import { useState as reactUseState } from "react";

export const useLocalStorage = (key, initialValue) => {
    const [state, setState] = reactUseState(() => {
        try {
            const currentValue = localStorage.getItem(key)
            return currentValue ? JSON.parse(currentValue) : initialValue
        } catch(e) {
            console.error(e)
            return initialValue
        }
    })

    const setValue = (value) => {
        try {
            const valueToStore = typeof value === "object" ? JSON.stringify(value) : value;
            setState(valueToStore)
            localStorage.setItem(key, valueToStore)
        } catch (e) {
            console.error(e)
        }
    }

    return [state, setValue]
}