export function generateGen(length = 10) {
    return Array.from({ length: length * 2 }, () => Math.random());
}

export function crossGens(a, b) {
    const result = [];
    for(let i = 0; i < a.length; i++) {
        result.push(Math.random() > 0.5 ? a[i] : b[i]);
    }
    return result;
}

export function mutate(gene, chance = 0.001) {
    const p = 1 - chance;
    return gene.map(g => Math.random() >= p ? Math.random() : g);
}