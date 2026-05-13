import { Settings2 } from 'lucide-react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/shared/ui';
import HomeHeaderSelect from './home-header-select';
import type {
    HomeHeaderSettingsProps,
    HomeHeaderSettingsValue,
} from './home-header.types';

const defaultSettings: HomeHeaderSettingsValue = {
    density: 'standard',
    showProjectName: true,
    showTaskCounters: true,
};

const HomeHeaderSettings = ({
    settings,
    onChange,
}: HomeHeaderSettingsProps) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground"
                aria-label="Настройки"
            >
                <Settings2 className="size-4" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3">
            <div className="space-y-3">
                <div>
                    <div className="text-sm font-medium text-foreground">
                        Настройки вида
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                        Управление плотностью и содержимым карточек на странице.
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="text-xs font-medium text-foreground">
                        Плотность
                    </div>
                    <HomeHeaderSelect
                        value={settings.density}
                        onChange={(density) =>
                            onChange?.({
                                ...settings,
                                density,
                            })
                        }
                        options={[
                            { label: 'Стандартная', value: 'standard' },
                            { label: 'Компактная', value: 'compact' },
                        ]}
                    />
                </div>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2">
                    <input
                        type="checkbox"
                        checked={settings.showProjectName}
                        onChange={(event) =>
                            onChange?.({
                                ...settings,
                                showProjectName: event.target.checked,
                            })
                        }
                        className="mt-0.5 size-4 rounded border-border accent-foreground"
                    />
                    <div>
                        <div className="text-xs font-medium text-foreground">
                            Показывать проект
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Отображать название проекта на карточках задач.
                        </div>
                    </div>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2">
                    <input
                        type="checkbox"
                        checked={settings.showTaskCounters}
                        onChange={(event) =>
                            onChange?.({
                                ...settings,
                                showTaskCounters: event.target.checked,
                            })
                        }
                        className="mt-0.5 size-4 rounded border-border accent-foreground"
                    />
                    <div>
                        <div className="text-xs font-medium text-foreground">
                            Показывать счетчики задач
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Показывать количество задач в колонках и днях.
                        </div>
                    </div>
                </label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-muted-foreground"
                    onClick={() => onChange?.(defaultSettings)}
                >
                    Сбросить настройки
                </Button>
            </div>
        </PopoverContent>
    </Popover>
);

export default HomeHeaderSettings;
