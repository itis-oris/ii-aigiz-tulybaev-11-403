import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
} from '@/shared/ui';

const ProfilePage = () => {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">
                            Профиль
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Управление личными настройками, языком интерфейса и
                            базовыми параметрами аккаунта.
                        </p>
                    </div>

                    <Card className="py-0 ring-0">
                        <CardContent className="px-0 py-0">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <Avatar
                                    size="2xl"
                                    className="bg-black text-base text-white"
                                >
                                    LI
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-xl font-semibold">
                                        Lorem Ipsum
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm">
                                        lorem.ipsum@example.com
                                    </CardDescription>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card className="py-0 ring-0">
                            <CardHeader className="px-0 py-0">
                                <CardTitle>Основное</CardTitle>
                                <CardDescription>
                                    Контактные и публичные данные профиля.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 px-0 py-0">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Имя
                                    </label>
                                    <Input
                                        uiSize="md"
                                        defaultValue="Lorem Ipsum"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Email
                                    </label>
                                    <Input
                                        uiSize="md"
                                        defaultValue="lorem.ipsum@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Роль
                                    </label>
                                    <Input
                                        uiSize="md"
                                        defaultValue="Product Owner"
                                    />
                                </div>
                                <Button size="md">Сохранить изменения</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
