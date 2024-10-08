
const Profile = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 py-10 flex items-center overflow-hidden border-0">
                    Profile
                    {/* <img src={itemData.item.image} alt={itemData.item.name} className="w-full h-auto" /> */}
                </div>
                <div className='py-10 space-y-10 w-full'>
                    {/* <h2 className='text-3xl font-bold text-gray-700 leading-relaxed'>
                        {itemData.item.name}
                    </h2> */}
                    {/* {
                        itemData.item.awarded ?
                            <AuctionEnded id={id!} itemData={itemData} triggerRefetch={triggerRefetch} /> :
                            <AuctionNotEnded id={id!} itemData={itemData} triggerRefetch={triggerRefetch} />
                    } */}
                </div>
            </div>
        </div>
    )
}

export default Profile
