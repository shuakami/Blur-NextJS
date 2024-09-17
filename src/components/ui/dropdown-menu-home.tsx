export default function DropdownMenuHome() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-white/20 from-black bg-gradient-to-b">
            <div
                className="w-auto max-w-4xl rounded-2xl border border-white/15 bg-[rgba(17,17,17,0.75)] shadow-lg backdrop-blur-[50px] py-1"
                style={{
                    boxShadow: 'rgba(0, 0, 0, 0.25) 0px 25px 50px 0px, rgba(0, 0, 0, 0.5) 0px 5px 25px 0px',
                }}>
                <ul className="grid grid-cols-3 gap-x-4 p-4 pl-6 pr-4"
                    style={{
                        gridTemplateColumns: 'repeat(3, minmax(100px, 1fr))',
                        gridTemplateRows: 'repeat(2, min-content)',
                        height: 'min-content'
                    }}>
                    <MenuColumn title="Design" items={[
                        {icon: "design", title: "Design", description: "Responsive design"},
                        {icon: "navigation", title: "Navigation", description: "Link pages"},
                        {icon: "animations", title: "Animations", description: "Refined animations"},
                    ]}/>
                    <MenuColumn title="Publish" items={[
                        {icon: "management", title: "Management", description: "Site control"},
                        {icon: "forms", title: "Forms", description: "Capture leads"},
                        {icon: "seo", title: "SEO", description: "Search optimized"},
                    ]}/>
                    <MenuColumn title="Scale" items={[
                        {icon: "localization", title: "Localization", description: "Global reach"},
                        {icon: "cms", title: "CMS", description: "Manage content"},
                        {icon: "ai", title: "AI", description: "Boost workflow"},
                    ]}/>
                </ul>
            </div>
        </div>
    )
}

function MenuColumn({title, items}) {
    return (
        <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold opacity-80 text-[#AAAAAA] pl-1"
                style={{
                    fontSize: '14px',
                    fontWeight: 550,
                    letterSpacing: '-0.01em',
                    lineHeight: '1em',
                    marginBottom: '5px', // 标题与下面内容的间距
                }}>
                {title}
            </h3>
            <ul className="space-y-5"> {/* 每个项目的垂直间距 */}
                {items.map((item, index) => (
                    <MenuItem key={index} icon={item.icon} title={item.title} description={item.description} />
                ))}
            </ul>
        </div>
    )
}


function MenuItem({ icon, title, description }) {
    return (
        <li className="flex items-start space-x-2" style={{width: '195px', height: 'auto', flex: '0 0 auto'}}>
            <div
                className="flex-shrink-0 w-9 h-9 rounded bg-[rgba(255,255,255,0.05)] flex items-center justify-center border border-[rgba(255,255,255,0.06)]"
                style={{
                    filter: 'invert(0)',
                    borderRadius: '8px',
                    willChange: 'auto',
                }}>
                <div className="w-5 h-5" style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(getIconSVG(icon))}")`,
                    backgroundSize: '100% 100%',
                    imageRendering: 'pixelated',
                }}></div>
            </div>
            <div className="flex flex-col">
                <h4 className="text-white text-sm font-medium"
                    style={{marginBottom: '2px'}}>{title}</h4>
                <p className="text-[#6E6E6E] text-xs">{description}</p>
            </div>
        </li>
    )
}

function getIconSVG(icon) {
    // This function would return the appropriate SVG string based on the icon name
    // For brevity, I'm only including the 'design' icon here
    const icons = {
        design: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M 1 5 C 1 2.791 2.791 1 5 1 L 8.5 1 C 9.052 1 9.5 1.448 9.5 2 L 9.5 18 C 9.5 18.552 9.052 19 8.5 19 L 5 19 C 2.791 19 1 17.209 1 15 Z" fill="rgb(255, 255, 255)"></path>
      <path d="M 10.5 2 C 10.5 1.448 10.948 1 11.5 1 L 15 1 C 17.209 1 19 2.791 19 5 L 19 8.5 C 19 9.052 18.552 9.5 18 9.5 L 11.5 9.5 C 10.948 9.5 10.5 9.052 10.5 8.5 Z" fill="rgb(255, 255, 255)" opacity="0.5"></path>
      <path d="M 10.5 11.5 C 10.5 10.948 10.948 10.5 11.5 10.5 L 18 10.5 C 18.552 10.5 19 10.948 19 11.5 L 19 15 C 19 17.209 17.209 19 15 19 L 11.5 19 C 10.948 19 10.5 18.552 10.5 18 Z" fill="rgb(255, 255, 255)" opacity="0.5"></path>
    </svg>`,
        // Add other icons here...
    };
    return icons[icon] || icons.design; // Default to design icon if not found
}