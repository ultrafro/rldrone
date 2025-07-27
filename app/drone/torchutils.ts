

import { torch } from "js-pytorch";
export function sampleFromProbs(probs: number[]){
    const total = probs.reduce((a, b) => a + b, 0);
    const random = Math.random();
    let cumulative = 0;
    for(let i = 0; i < probs.length; i++){
        cumulative += probs[i];
        if(random < cumulative){
            return i;
        }
    }
    return probs.length - 1;
}




export function getLogProbOfAction(actionIndex: number, actionProbabilitiesTensor: any, t: typeof torch){

    const new_log_prob = t.log(actionProbabilitiesTensor.at(t.tensor([0]), t.tensor([actionIndex])));

    return new_log_prob;


    const actionIndexTensor = t.tensor([actionIndex]);
    const index0Tensor = t.tensor([0]);
    const actionProbabilityTensor = actionProbabilitiesTensor.at(index0Tensor, actionIndexTensor);
    const result = t.log(actionProbabilityTensor);

    return result;
}


export function torch_clamp(t: typeof torch, x: any, min: any, max: any){
    const sampleTensor = new t.Tensor([0]);
    const x_tensor = x as typeof sampleTensor;
    const min_tensor = min as typeof sampleTensor;
    const max_tensor = max as typeof sampleTensor;

    return torch_min(t, torch_max(t, x_tensor, min_tensor), max_tensor);
}

export function torch_min(t: typeof torch, x: any, y: any){
    const sampleTensor = new t.Tensor([0]);
    const x_tensor = x as typeof sampleTensor;
    const y_tensor = y as typeof sampleTensor;

    const xpy = t.add(x_tensor, y_tensor);
    const xmy = x_tensor.sub(y_tensor);
    const xmy_abs = torch_abs(t, xmy);

    return t.div(
        xpy.sub(xmy_abs), 
        new t.Tensor([2])
    )
}

export function torch_max(t: typeof torch, x: any, y: any){
    const sampleTensor = new t.Tensor([0]);

    const x_tensor = x as typeof sampleTensor;
    const y_tensor = y as typeof sampleTensor;

    const xpy = t.add(x_tensor, y_tensor);
    const xmy = x_tensor.sub(y_tensor);
    const xmy_abs = torch_abs(t, xmy);

    return t.div(
        t.add(xpy, xmy_abs), 
        new t.Tensor([2])
    )
}

export function torch_abs(t: typeof torch, x: any){
    const sampleTensor = new t.Tensor([0]);
    return t.sqrt(t.pow(x as typeof sampleTensor, 2.0))
}
