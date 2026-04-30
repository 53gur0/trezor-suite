import {
    type Abi,
    type AbiFunction,
    type ContractFunctionName,
    type DecodeFunctionResultReturnType,
    decodeFunctionResult,
} from 'viem';

export const createParser = <const T extends Abi>(config: { abi: T }) => {
    const functions = config.abi.filter((item): item is AbiFunction => item.type === 'function');

    if (functions.length === 0) throw new Error('No function in ABI');
    if (functions.length > 1) throw new Error('ABI must contain exactly one function');

    const fnName = functions[0].name as ContractFunctionName<T>;

    return (data: `0x${string}`): DecodeFunctionResultReturnType<T, ContractFunctionName<T>> =>
        decodeFunctionResult({
            abi: config.abi,
            functionName: fnName,
            data,
        } as Parameters<typeof decodeFunctionResult>[0]) as DecodeFunctionResultReturnType<
            T,
            ContractFunctionName<T>
        >;
};
