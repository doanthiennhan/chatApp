export const mockCurrentUser = {
    id: 1,
    name: 'Nguyễn Văn Minh',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};

export const mockUsers = [
    { id: 2, name: 'Trần Thị Bích', avatar: 'https://i.pravatar.cc/150?u=bich.tran', role: 'Kỹ thuật viên' },
    { id: 3, name: 'Lê Văn Luyện', avatar: 'https://i.pravatar.cc/150?u=luyen.le', role: 'Giám sát' },
    { id: 4, name: 'Phạm Thị Duyên', avatar: 'https://i.pravatar.cc/150?u=duyen.pham', role: 'Người dùng' },
    { id: 5, name: 'Hoàng Văn Hùng', avatar: 'https://i.pravatar.cc/150?u=hung.hoang', role: 'Người dùng' },
    { id: 6, name: 'Kỹ thuật viên 1', avatar: 'https://i.pravatar.cc/150?u=tech1', role: 'Kỹ thuật viên' },
    { id: 7, name: 'Kỹ thuật viên 2', avatar: 'https://i.pravatar.cc/150?u=tech2', role: 'Kỹ thuật viên' },
];

const mockMembers = {
    group1: [
        { id: 1, name: 'Nguyễn Văn Minh', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', role: 'Admin' },
        ...mockUsers.slice(0, 4)
    ],
    group2: [
        { id: 1, name: 'Nguyễn Văn Minh', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', role: 'Admin' },
        mockUsers[4], mockUsers[5]
    ]
}

export const mockConversations = [
    {
        id: 1,
        name: 'Nhóm dự án Camera',
        avatar: 'https://i.pravatar.cc/150?u=group1',
        lastMessage: 'Mình đã gửi file thiết kế mới.',
        time: '10:30',
        unread: 2,
        isGroup: true,
        memberCount: 5,
        active: true,
        members: mockMembers.group1
    },
    {
        id: 2,
        name: 'Trần Thị Bích',
        avatar: 'https://i.pravatar.cc/150?u=bich.tran',
        lastMessage: 'Bạn có tài liệu về HLS không?',
        time: '09:15',
        unread: 0,
        isGroup: false
    },
    {
        id: 3,
        name: 'Hỗ trợ kỹ thuật',
        avatar: 'https://i.pravatar.cc/150?u=support',
        lastMessage: 'Vui lòng cung cấp ID camera.',
        time: 'Hôm qua',
        unread: 1,
        isGroup: true,
        memberCount: 3,
        members: mockMembers.group2
    },
    {
        id: 4,
        name: 'Lê Văn Luyện',
        avatar: 'https://i.pravatar.cc/150?u=luyen.le',
        lastMessage: 'Cảm ơn bạn nhiều nhé!',
        time: 'Thứ 2',
        unread: 0,
        isGroup: false
    },
];

export const mockMessages = [
    { id: 1, sender: { id: 2, name: 'Trần Thị Bích', avatar: 'https://i.pravatar.cc/150?u=bich.tran' }, type: 'text', content: 'Chào bạn, mình có một vài câu hỏi về hệ thống camera.' },
    { id: 2, sender: mockCurrentUser, type: 'text', content: 'Chào bạn, mình có thể giúp gì cho bạn?' },
    { id: 3, type: 'system', content: 'Cuộc trò chuyện đã được mã hóa đầu cuối.' },
    { id: 4, sender: { id: 2, name: 'Trần Thị Bích', avatar: 'https://i.pravatar.cc/150?u=bich.tran' }, type: 'image', content: 'https://images.unsplash.com/photo-1584969329950-0572a933343a?q=80&w=200' },
    { id: 5, sender: mockCurrentUser, type: 'file', content: { name: 'tailieu_cauhinh_HLS.pdf', size: '2.5 MB' } },
    { id: 6, sender: mockCurrentUser, type: 'text', content: 'Mình đã gửi file thiết kế mới.' },
];
