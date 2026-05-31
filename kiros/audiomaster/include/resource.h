#pragma once

// Icons
#define IDI_AUDIOMASTER_ICON       101
#define IDI_VOLUME_ICON            102
#define IDI_MUTE_ICON              103
#define IDI_DEVICE_ICON            104
#define IDI_EQUALIZER_ICON         105
#define IDI_PEAKMETER_ICON         106

// Cursors
#define IDC_VOLUME_CURSOR          201

// Bitmaps
#define IDB_MAIN_BACKGROUND        301
#define IDB_PEAK_METER             302
#define IDB_VOLUME_SLIDER          303
#define IDB_EQUALIZER_BANDS        304

// Menus
#define IDR_MAIN_MENU              401
#define IDR_TRAY_MENU              402
#define IDR_CONTEXT_MENU           403

// Accelerators
#define IDR_MAIN_ACCELERATORS      501

// Dialog IDs
#define IDD_ABOUT_DIALOG           601
#define IDD_EQUALIZER_DIALOG       602
#define IDD_DEVICE_PROPERTIES      603
#define IDD_HOTKEYS_DIALOG         604
#define IDD_MIXER_DIALOG           605
#define IDD_RECORDER_DIALOG        606
#define IDD_PLAYER_DIALOG          607
#define IDD_CONVERTER_DIALOG       608
#define IDD_ANALYZER_DIALOG        609
#define IDD_ROUTING_DIALOG         610
#define IDD_PROFILES_DIALOG        611
#define IDD_SETTINGS_DIALOG        612

// Control IDs
#define IDC_STATIC                 -1

// Main window controls
#define IDC_VOLUME_SLIDER          1001
#define IDC_MUTE_CHECKBOX          1002
#define IDC_DEVICE_COMBO           1003
#define IDC_SESSION_LIST           1004
#define IDC_PEAK_METER             1005
#define IDC_EQUALIZER_BUTTON       1006
#define IDC_ROUTING_BUTTON         1007
#define IDC_MIXER_BUTTON           1008
#define IDC_RECORDER_BUTTON        1009
#define IDC_PLAYER_BUTTON          1010
#define IDC_CONVERTER_BUTTON       1011
#define IDC_ANALYZER_BUTTON        1012
#define IDC_SETTINGS_BUTTON        1013
#define IDC_PROFILES_BUTTON        1014
#define IDC_ABOUT_BUTTON           1015

// Equalizer dialog controls
#define IDC_EQUALIZER_SLIDER1      1101
#define IDC_EQUALIZER_SLIDER2      1102
#define IDC_EQUALIZER_SLIDER3      1103
#define IDC_EQUALIZER_SLIDER4      1104
#define IDC_EQUALIZER_SLIDER5      1105
#define IDC_EQUALIZER_SLIDER6      1106
#define IDC_EQUALIZER_SLIDER7      1107
#define IDC_EQUALIZER_SLIDER8      1108
#define IDC_EQUALIZER_SLIDER9      1109
#define IDC_EQUALIZER_SLIDER10     1110
#define IDC_PRESET_COMBO           1111
#define IDC_LOAD_PRESET            1112
#define IDC_SAVE_PRESET            1113
#define IDC_ENABLE_EQUALIZER       1114
#define IDC_AUTO_GAIN              1115

// Device properties controls
#define IDC_DEVICE_NAME            1201
#define IDC_DEVICE_STATUS          1202
#define IDC_DEVICE_FORMAT          1203
#define IDC_ENHANCE_LOUDNESS       1204
#define IDC_ENHANCE_SURROUND       1205
#define IDC_ENHANCE_ROOMCORRECTION 1206
#define IDC_ENHANCE_BASSMANAGEMENT 1207
#define IDC_ENHANCE_SPEAKERFILL    1208
#define IDC_ENHANCE_DISABLEALL     1209
#define IDC_ADVANCED_SETTINGS      1210
#define IDC_TEST_BUTTON            1211
#define IDC_APPLY_BUTTON           1212

// Hotkey dialog controls
#define IDC_HOTKEY_LIST            1301
#define IDC_ACTION_COMBO           1302
#define IDC_HOTKEY_EDIT            1303
#define IDC_ADD_BUTTON             1304
#define IDC_REMOVE_BUTTON          1305
#define IDC_MODIFY_BUTTON          1306
#define IDC_CLEAR_BUTTON           1307

// Mixer dialog controls
#define IDC_INPUT_LIST             1401
#define IDC_ADD_FILES              1402
#define IDC_REMOVE_FILE            1403
#define IDC_CLEAR_FILES            1404
#define IDC_OUTPUT_FILE            1405
#define IDC_BROWSE_OUTPUT          1406
#define IDC_FORMAT_COMBO           1407
#define IDC_BITRATE_COMBO          1408
#define IDC_NORMALIZE_CHECK        1409
#define IDC_FADE_CHECK             1410
#define IDC_REMOVE_SILENCE_CHECK   1411
#define IDC_START_MIXING           1412
#define IDC_STOP_MIXING            1413
#define IDC_PROGRESS_BAR           1414

// Menu commands
#define ID_FILE_NEW_PROFILE        2001
#define ID_FILE_LOAD_PROFILE       2002
#define ID_FILE_SAVE_PROFILE       2003
#define ID_FILE_IMPORT             2004
#define ID_FILE_EXPORT             2005
#define ID_FILE_EXIT               2006

#define ID_VIEW_ALWAYSONTOP        2101
#define ID_VIEW_SHOWPEAKS          2102
#define ID_VIEW_SHOWDEVICES        2103
#define ID_VIEW_SHOWSESSIONS       2104
#define ID_VIEW_COMPACT            2105
#define ID_VIEW_FULL               2106
#define ID_VIEW_REFRESH            2107

#define ID_DEVICES_PLAYBACK        2201
#define ID_DEVICES_RECORDING       2202
#define ID_DEVICES_SETDEFAULT      2203
#define ID_DEVICES_PROPERTIES      2204
#define ID_DEVICES_ENHANCEMENTS    2205

#define ID_EFFECTS_EQUALIZER       2301
#define ID_EFFECTS_COMPRESSOR      2302
#define ID_EFFECTS_REVERB          2303
#define ID_EFFECTS_BASSBOOST       2304
#define ID_EFFECTS_SURROUND        2305
#define ID_EFFECTS_NOISESUPPRESSION 2306
#define ID_EFFECTS_ECHOCANCELLATION 2307
#define ID_EFFECTS_ROOMCORRECTION  2308

#define ID_ROUTING_APPLICATIONS    2401
#define ID_ROUTING_DEVICES         2402
#define ID_ROUTING_CREATE          2403
#define ID_ROUTING_MANAGE          2404

#define ID_TOOLS_MIXER             2501
#define ID_TOOLS_RECORDER          2502
#define ID_TOOLS_PLAYER            2503
#define ID_TOOLS_CONVERTER         2504
#define ID_TOOLS_ANALYZER          2505
#define ID_TOOLS_SILENCEDETECTOR   2506
#define ID_TOOLS_NORMALIZER        2507

#define ID_SETTINGS_GENERAL        2601
#define ID_SETTINGS_HOTKEYS        2602
#define ID_SETTINGS_NOTIFICATIONS  2603
#define ID_SETTINGS_QUALITY        2604
#define ID_SETTINGS_BACKUP         2605
#define ID_SETTINGS_RESTORE        2606

#define ID_HELP_GUIDE              2701
#define ID_HELP_SHORTCUTS          2702
#define ID_HELP_UPDATES            2703
#define ID_HELP_ABOUT              2704

// Tray menu commands
#define ID_TRAY_SHOW               2801
#define ID_TRAY_HIDE               2802
#define ID_TRAY_EXIT               2803
#define ID_TRAY_VOLUME_UP          2804
#define ID_TRAY_VOLUME_DOWN        2805
#define ID_TRAY_MUTE               2806
#define ID_TRAY_DEVICE             2807
#define ID_TRAY_EQUALIZER          2808

// String table IDs
#define IDS_APP_TITLE              3001
#define IDS_DEVICE_PLAYBACK        3002
#define IDS_DEVICE_RECORDING       3003
#define IDS_VOLUME                 3004
#define IDS_MUTE                   3005
#define IDS_PEAK_METER             3006
#define IDS_EQUALIZER              3007
#define IDS_COMPRESSOR             3008
#define IDS_REVERB                 3009
#define IDS_BASS_BOOST             3010
#define IDS_VIRTUAL_SURROUND       3011
#define IDS_NOISE_SUPPRESSION      3012
#define IDS_ECHO_CANCELLATION      3013
#define IDS_ROOM_CORRECTION        3014
#define IDS_AUDIO_MIXER            3015
#define IDS_AUDIO_RECORDER         3016
#define IDS_AUDIO_PLAYER           3017
#define IDS_AUDIO_CONVERTER        3018
#define IDS_AUDIO_ANALYZER         3019
#define IDS_SILENCE_DETECTOR       3020
#define IDS_AUDIO_NORMALIZER       3021
#define IDS_HOTKEYS                3022
#define IDS_NOTIFICATIONS          3023
#define IDS_AUDIO_QUALITY          3024
#define IDS_BACKUP_SETTINGS        3025
#define IDS_RESTORE_SETTINGS       3026
#define IDS_USER_GUIDE             3027
#define IDS_KEYBOARD_SHORTCUTS     3028
#define IDS_CHECK_UPDATES          3029
#define IDS_ABOUT_AUDIOMASTER      3030