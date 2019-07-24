namespace Project {
	export interface Project {
		title: string;
		version: string | number;
		author?: string;

		directories: {
			bgm: DirectoryPath;
			se: DirectoryPath;
		}

		resources: {
			images: {
				background: ImageObject[];
			}

			sounds: {
				bgm: AudioObject[];
				se: AudioObject[];
			}

			videos: [];
		}

		system: {
			world: {
				tiles: TileObject[];
				maps: MapObject[];
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

	interface ImageObject extends LoadableObject { name: string }
	interface AudioObject extends LoadableObject { id: number, volume: number }
	interface TileObject extends LoadableObject { name: string }
	interface MapObject extends LoadableObject { name: string, tileId: number }

	interface LoadableObject { file: FilePath }
	type DirectoryPath = string;
	type FilePath = string;
}