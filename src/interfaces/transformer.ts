import StandardStock from "../standardStock";

export interface Transformer {
    transform(data: Record<string, any>, stock?: StandardStock): StandardStock;
}