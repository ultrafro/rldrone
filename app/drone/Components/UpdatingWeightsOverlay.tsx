export function UpdatingWeightsOverlay(){
    return (                
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 pointer-events-none">
            <div className="bg-white  px-4 py-2 rounded-md shadow-md">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm font-normal text-gray-700">Updating weights...</span>
                </div>
            </div>
        </div>
    );
}

