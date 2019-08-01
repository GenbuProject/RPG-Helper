namespace Project {
	/** プロジェクトファイルの設定構成 */
	export interface Project {
		title: string;
		version: string | number;
		author?: string;

		directories: {
			bgm: DirectoryPath;
			se: DirectoryPath;

			world: {
				maps: DirectoryPath;
				tiles: DirectoryPath;
			}
		}

		resources: {
			images: {
				[imageName: string]: ImageObject;
			}

			sounds: {
				bgm: AudioObject[];
				se: AudioObject[];
			}

			videos: [];
		}

		system: {
			world: {
				maps: MapObject[];
				tiles: TileObject[];
			}

			monster?: {
				monsters: FilePath[];
				groups: FilePath[];
			}

			items?: FilePath[];
			magics?: FilePath[];

			[optionalField: string]: any;
		}
	}

	interface ImageObject extends LoadableObject { name: string, file: FilePath }

	interface AudioObject extends LoadableObject {
		id: number;

		options?: {
			loop?: boolean;
			loopStart?: number;
			loopEnd?: number;
			playbackRate?: number;
		}
	}

	interface MapObject extends LoadableObject { name: string, tileId: number }
	interface TileObject extends LoadableObject { name: string }

	interface LoadableObject { file: FilePath | FileName }

	type FileName = string;
	type DirectoryPath = string;
	type FilePath = string;
}